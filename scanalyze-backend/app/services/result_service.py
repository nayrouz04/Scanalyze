""" 
app/services/result_service.py - Extracted fields and results business logic
"""
import json
import logging
import uuid
from datetime import datetime, timezone

import fitz
from fastapi import status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job import ExtractionJob
from app.models.result import ExtractedField, Result
from app.models.user import User
from app.models.document import Document

logger = logging.getLogger(__name__)


OCR_FIELD_NAMES = {"ocr_text", "text", "full_text", "document_text"}


def _clean_export_text(value: str | None) -> str | None:
    if value is None:
        return None
    text = str(value).replace("\r", "")
    lines = [" ".join(line.split()) for line in text.split("\n")]
    return "\n".join(line for line in lines if line).strip() or None


def _field_export_value(field: ExtractedField) -> str | None:
    """Use the most useful value for final exports."""
    field_name = (field.field_name or "").lower()
    field_category = (field.field_category or "").lower()

    if field_name in OCR_FIELD_NAMES or field_category == "ocr":
        return _clean_export_text(field.ocr_value or field.raw_value or field.normalized_value)

    if field.is_validated and field.normalized_value:
        return _clean_export_text(field.normalized_value)

    return _clean_export_text(field.raw_value or field.ocr_value or field.normalized_value)


def _format_percent(value: float | int | str | None) -> str:
    if value is None:
        return "-"
    try:
        return f"{float(value) * 100:.1f}%"
    except (TypeError, ValueError):
        return str(value)


def _format_duration(duration_ms: int | float | None) -> str:
    if duration_ms is None:
        return "-"
    try:
        seconds = float(duration_ms) / 1000
    except (TypeError, ValueError):
        return str(duration_ms)
    if seconds >= 60:
        return f"{seconds / 60:.1f} min"
    return f"{seconds:.1f} sec"


def _format_datetime(value: str | None) -> str:
    if not value:
        return "-"
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return str(value)
    return parsed.strftime("%Y-%m-%d %H:%M UTC")


class ResultError(Exception):
    """Domain-level result error — converted to HTTP response in the router."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

#_____ ResultService _______
class ResultService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def _get_job(
        self, 
        job_id: uuid.UUID, 
        current_user: User
    ) -> ExtractionJob:
        """Helper method to get a job and check permissions."""
        result = await self.db.execute(
            select(ExtractionJob).where(ExtractionJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        if job is None:
            raise ResultError("Job not found", status.HTTP_404_NOT_FOUND)
        if job.triggered_by != current_user.id:
            raise ResultError("You are not allowed to access this job", status.HTTP_403_FORBIDDEN)
        return job
    
    async def get_field(
        self,
        field_id: uuid.UUID,
        current_user: User,
    ) -> ExtractedField:
        """verify that the field exists and belongs to the user"""
        result = await self.db.execute(
            select(ExtractedField).where(ExtractedField.id == field_id)
        )
        field = result.scalar_one_or_none()
        if field is None:
            raise ResultError("Field not found", status.HTTP_404_NOT_FOUND)
        
        # Check that the user has access to the job this field belongs to
        await self._get_job(field.job_id, current_user)
        
        return field
    
    #_____ get all extracted fields _______

    async def get_extracted_fields(
        self,
        job_id: uuid.UUID,
        current_user: User,
    ) -> list[ExtractedField]:
        """
        Retrieve all extracted fields for a job
        used in Interface 1 (Extracted Fields + JSON Preview)
        and Interface 2 (Verification Editor)
        """
        job = await self._get_job(job_id, current_user)  
        
        #verify that the job is completed 
        if job.status != "done":
            raise ResultError(f"Job is not doneyet, current status: {job.status}", status.HTTP_400_BAD_REQUEST)

        result = await self.db.execute(
            select(ExtractedField).where(ExtractedField.job_id == job_id).order_by(ExtractedField.created_at.asc())
        )
        return result.scalars().all()

    async def get_processing_history(self, current_user: User) -> list[dict]:
        """Return processed jobs for the history page."""
        stmt = (
            select(
                ExtractionJob,
                Document,
                Result,
                func.avg(ExtractedField.confidence).label("avg_confidence"),
                func.count(ExtractedField.id).label("fields_count"),
            )
            .join(Document, Document.id == ExtractionJob.document_id)
            .outerjoin(Result, Result.job_id == ExtractionJob.id)
            .outerjoin(ExtractedField, ExtractedField.job_id == ExtractionJob.id)
            .where(Document.is_deleted == False)
            .where(ExtractionJob.status == "done")
            .group_by(ExtractionJob.id, Document.id, Result.id)
            .order_by(func.coalesce(Result.exported_at, ExtractionJob.completed_at, ExtractionJob.created_at).desc())
        )

        if current_user.role != "admin":
            stmt = stmt.where(ExtractionJob.triggered_by == current_user.id)

        rows = (await self.db.execute(stmt)).all()
        history = []
        for job, document, exported_result, avg_confidence, fields_count in rows:
            base_name = (document.original_filename or document.filename).rsplit(".", 1)[0]
            exported_data = exported_result.exported_data if exported_result else None
            size = f"{len(exported_data.encode('utf-8')) / 1024:.1f} KB" if exported_data else None

            history.append(
                {
                    "id": exported_result.id if exported_result else job.id,
                    "job_id": job.id,
                    "document_id": document.id,
                    "source_document": document.original_filename or document.filename,
                    "json_filename": f"{base_name}_result.json",
                    "doc_type": document.file_type,
                    "processed_at": exported_result.exported_at if exported_result else job.completed_at,
                    "processing_time_ms": job.duration_ms,
                    "confidence": document.confidence_score or avg_confidence,
                    "fields_extracted": fields_count,
                    "language": "fr",
                    "size": size,
                    "status": job.status,
                    "exported_data": exported_data,
                }
            )

        return history
    
    #_____ validate/correct a field _______
    async def validate_field(
        self,
        field_id: uuid.UUID,
        normalized_value: str,
        current_user: User,
    ) -> ExtractedField:
        """
        Triggered when the user clicks Correct 
        Updates the field with the corrected value
        """
        field = await self.get_field(field_id, current_user)
        
        # Update the field with the corrected value and set is_validated to True
        field.normalized_value = normalized_value
        field.is_validated = True
        field.is_skipped = False
        field.validated_by = current_user.id
        field.validated_at = datetime.now(timezone.utc)
        
        await self.db.flush()
        
        logger.info("Field %s validated by user %s", field_id, current_user.email)
        
        return field
    
    #_____ skip a field _______
    async def skip_field(
        self,
        field_id: uuid.UUID,
        current_user: User,
    ) -> ExtractedField:
        """
        Triggered when the user clicks Skip 
        """
        field = await self.get_field(field_id, current_user)
        
        # Mark the field as skipped
        field.is_validated = False
        field.is_skipped = True
        
        await self.db.flush()
        logger.info("Field %s skipped by user %s", field_id, current_user.email)
        
        return field
    
    #_____ approve _______
    async def approve(
        self,
        job_id: uuid.UUID,
        current_user: User,
    ) -> None:
        """
        Triggered when the user clicks Approve, confirms that the user has completed verification
        No more changes allowed to the fields after this action
        """
        await self._get_job(job_id, current_user)
        logger.info("Job %s approved by user %s", job_id, current_user.email)
        
    #_____ export results as JSON _______
    async def export_results(
        self,
        job_id: uuid.UUID, 
        current_user: User
    ) -> str:
        """
        Export the results of a job as a JSON file
        Used in the Export interface
        """
        job = await self._get_job(job_id, current_user)

        result = await self.db.execute(
            select(ExtractedField).where(ExtractedField.job_id == job_id)
        )
        fields = result.scalars().all()
        
        # Convert fields to a dict for JSON export
        extracted_data = {}
        for field in fields:
            if field.is_validated:
                # user corrected the field → export normalized_value
                extracted_data[field.field_name] = field.normalized_value
            else:
                # user skipped or did not process the field → export raw_value
                extracted_data[field.field_name] = field.raw_value

        for field in fields:
            extracted_data[field.field_name] = _field_export_value(field)
        
        #calculate the average confidence score
        #retrieve only fields that contain a confidence value (not None)
        confidence_values = [
            field.confidence for field in fields if field.confidence is not None 
        ]
        if confidence_values:
            confidence_score = sum(confidence_values) / len(confidence_values)
        else:
            confidence_score = None
            
        #update the document with the average confidence score
        doc_result = await self.db.execute(
            select(Document).where(Document.id == job.document_id)
        )
        document = doc_result.scalar_one_or_none()
        if document:
            document.confidence_score = confidence_score
            document.status = "done"
            await self.db.flush()
            
        export_payload = {
            "document_id": str(job.document_id),
            "job_id": str(job.id),
            "status": job.status,
            "ocr_engine": job.ocr_engine,
            "ai_model": job.ai_model,
            "confidence_score": confidence_score,
            "duration_ms": job.duration_ms,
            "processed_at": job.completed_at.isoformat() if job.completed_at else None,
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "source_document": document.original_filename if document else None,
            "file_type": document.file_type if document else None,
            "fields_count": len(fields),
            "extracted_data": extracted_data,
            "fields": [
                {
                    "id": str(field.id),
                    "name": field.field_name,
                    "label": field.field_label,
                    "category": field.field_category,
                    "value": extracted_data.get(field.field_name),
                    "ocr_value": field.ocr_value,
                    "raw_value": field.raw_value,
                    "normalized_value": field.normalized_value,
                    "confidence": field.confidence,
                    "is_validated": field.is_validated,
                    "is_skipped": field.is_skipped,
                    "page_number": field.page_number,
                }
                for field in fields
            ],
        }

        # Save to the results table
        exported_data_str = json.dumps(export_payload, ensure_ascii=False, indent=2)
        result_obj = Result(
            document_id=job.document_id,
            job_id=job_id,
            exported_data=exported_data_str,
            exported_by=current_user.id,
        )
        self.db.add(result_obj)
        await self.db.flush()
        
        logger.info("Results exported for job %s by user %s | confidence_score: %s", job_id, current_user.email, confidence_score)
        return exported_data_str

    async def export_results_pdf(
        self,
        job_id: uuid.UUID,
        current_user: User,
    ) -> bytes:
        """Export the same result payload as a polished PDF report."""
        exported_data_str = await self.export_results(job_id=job_id, current_user=current_user)
        payload = json.loads(exported_data_str)

        pdf = fitz.open()
        page_width = 595
        page_height = 842
        margin = 44
        content_width = page_width - (margin * 2)
        footer_y = page_height - 28
        y = 0

        ink = (0.10, 0.13, 0.20)
        muted = (0.39, 0.44, 0.53)
        blue = (0.10, 0.33, 0.68)
        pale_blue = (0.90, 0.95, 1.00)
        border = (0.83, 0.87, 0.92)
        panel = (0.98, 0.99, 1.00)
        navy = (0.06, 0.11, 0.20)

        def add_page():
            page = pdf.new_page(width=page_width, height=page_height)
            page.draw_rect(fitz.Rect(0, 0, page_width, 112), color=navy, fill=navy)
            page.draw_rect(fitz.Rect(0, 108, page_width, 112), color=blue, fill=blue)
            page.insert_text((margin, 42), "SCANALYZE", fontsize=9, color=(0.70, 0.82, 1.00), fontname="helv")
            page.insert_text((margin, 74), "Document Extraction Report", fontsize=23, color=(1, 1, 1), fontname="helv")
            page.insert_text((margin, 96), str(payload.get("source_document") or "Processed document"), fontsize=10, color=(0.83, 0.88, 0.96), fontname="helv")
            page.insert_text((margin, footer_y), "Generated by Scanalyze", fontsize=8, color=muted, fontname="helv")
            return page

        def ensure_space(page, needed=40):
            nonlocal y
            if y + needed <= footer_y - 18:
                return page
            page = add_page()
            y = 140
            return page

        def text_width(text, size=9):
            return fitz.get_text_length(str(text), fontname="helv", fontsize=size)

        def wrap_text(text, size=9, max_width=content_width):
            words = str(text or "").replace("\r", "").split()
            if not words:
                return [""]

            lines = []
            current = ""
            for word in words:
                candidate = f"{current} {word}".strip()
                if text_width(candidate, size) <= max_width:
                    current = candidate
                    continue
                if current:
                    lines.append(current)
                current = word
                while text_width(current, size) > max_width and len(current) > 1:
                    split_at = max(1, int(len(current) * max_width / text_width(current, size)))
                    lines.append(current[:split_at])
                    current = current[split_at:]
            if current:
                lines.append(current)
            return lines

        def write_line(page, text, size=10, color=ink, line_height=14):
            nonlocal y
            page = ensure_space(page, line_height + 2)
            page.insert_text((margin, y), text, fontsize=size, color=color, fontname="helv")
            y += line_height
            return page

        def write_section_title(page, title):
            nonlocal y
            page = ensure_space(page, 34)
            page.insert_text((margin, y), title, fontsize=13, color=ink, fontname="helv")
            y += 18
            return page

        def write_label_value(page, x, y_pos, label, value, width):
            page.insert_text((x, y_pos), str(label).upper(), fontsize=7, color=muted, fontname="helv")
            value_lines = wrap_text(value if value is not None else "-", size=9, max_width=width)
            line_y = y_pos + 14
            for line in value_lines[:2]:
                page.insert_text((x, line_y), line, fontsize=9, color=ink, fontname="helv")
                line_y += 12

        def write_summary_cards(page):
            nonlocal y
            cards = [
                ("Status", str(payload.get("status") or "-").upper()),
                ("Confidence", _format_percent(payload.get("confidence_score"))),
                ("Fields", str(payload.get("fields_count") or 0)),
                ("Duration", _format_duration(payload.get("duration_ms"))),
            ]
            gap = 10
            card_width = (content_width - gap * 3) / 4
            card_height = 58
            for index, (label, value) in enumerate(cards):
                x = margin + index * (card_width + gap)
                page.draw_rect(fitz.Rect(x, y, x + card_width, y + card_height), color=border, fill=panel)
                page.insert_text((x + 12, y + 21), label.upper(), fontsize=7, color=muted, fontname="helv")
                page.insert_text((x + 12, y + 43), value, fontsize=13, color=blue if index == 1 else ink, fontname="helv")
            y += card_height + 26

        def write_metadata_grid(page):
            nonlocal y
            page = write_section_title(page, "Document Details")
            rows = [
                (("Source", payload.get("source_document")), ("OCR Engine", payload.get("ocr_engine"))),
                (("Processed", _format_datetime(payload.get("processed_at"))), ("Exported", _format_datetime(payload.get("exported_at")))),
                (("Document ID", payload.get("document_id")), ("Job ID", payload.get("job_id"))),
            ]
            row_height = 48
            col_gap = 18
            col_width = (content_width - col_gap) / 2
            for left, right in rows:
                page = ensure_space(page, row_height)
                write_label_value(page, margin, y, left[0], left[1], col_width)
                write_label_value(page, margin + col_width + col_gap, y, right[0], right[1], col_width)
                y += row_height
            y += 8
            return page

        def write_wrapped_block(page, text, size=9, bg=True):
            nonlocal y
            paragraphs = str(text or "-").replace("\r", "").split("\n")
            lines = []
            for paragraph in paragraphs:
                lines.extend(wrap_text(paragraph, size=size, max_width=content_width - 24))
            line_height = size + 4
            block_height = max(40, len(lines) * line_height + 22)
            page = ensure_space(page, block_height + 8)
            if bg:
                page.draw_rect(fitz.Rect(margin, y, margin + content_width, y + block_height), color=border, fill=(0.99, 0.99, 0.99))
                x = margin + 12
                text_y = y + 20
            else:
                x = margin
                text_y = y
            for line in lines:
                page.insert_text((x, text_y), line, fontsize=size, color=ink, fontname="helv")
                text_y += line_height
            y += block_height + 12
            return page

        page = add_page()
        y = 142
        write_summary_cards(page)
        page = write_metadata_grid(page)

        page = write_section_title(page, "Extracted Content")

        fields = payload.get("fields") or []
        if not fields:
            page = write_line(page, "No extracted fields.", size=10)

        for field_data in fields:
            page = ensure_space(page, 70)
            label = field_data.get("label") or field_data.get("name") or "field"
            confidence = field_data.get("confidence")
            page.draw_rect(fitz.Rect(margin, y, margin + content_width, y + 28), color=pale_blue, fill=pale_blue)
            page.insert_text((margin + 12, y + 19), str(label), fontsize=10, color=blue, fontname="helv")
            confidence_label = f"Confidence {_format_percent(confidence)}"
            confidence_width = text_width(confidence_label, 8)
            page.insert_text((margin + content_width - confidence_width - 12, y + 19), confidence_label, fontsize=8, color=muted, fontname="helv")
            y += 36
            page = write_wrapped_block(page, field_data.get("value"), size=9)

        return pdf.tobytes()
