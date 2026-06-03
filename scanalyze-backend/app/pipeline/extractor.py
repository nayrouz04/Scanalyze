"""
OCR extraction stage.

Runs EasyOCR on the preprocessed image and stores the extracted text as
ExtractedField rows for the editor/verification screens.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any

import cv2
import easyocr
import numpy as np
from sqlalchemy import select

from app.db.session import get_sync_db
from app.models.job import ExtractionJob
from app.models.result import ExtractedField
from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)

_reader: easyocr.Reader | None = None


def get_easyocr_reader() -> easyocr.Reader:
    """Create the OCR reader once per worker process."""
    global _reader
    if _reader is None:
        logger.info("[OCR] Loading EasyOCR reader")
        _reader = easyocr.Reader(["fr", "en"], gpu=False)
    return _reader


class OCRExtractionStage(PipelineStage):
    """Extract text from the preprocessed document image."""

    async def execute(self, input_data: dict[str, Any], job_id: str) -> StageResult:
        try:
            document_id = input_data.get("document_id")
            image = input_data.get("image")

            if not document_id:
                raise ValueError("Missing required input field 'document_id'")
            if image is None or not isinstance(image, np.ndarray) or image.size == 0:
                raise ValueError("Missing or invalid preprocessed image")

            job_uuid = uuid.UUID(job_id)
            document_uuid = uuid.UUID(str(document_id))

            logger.info("[OCR] Starting EasyOCR for job=%s", job_id)
            rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            ocr_rows = get_easyocr_reader().readtext(rgb_image, detail=1, paragraph=False)

            lines: list[str] = []
            confidences: list[float] = []
            for row in ocr_rows:
                if len(row) < 3:
                    continue
                _bbox, text, confidence = row
                cleaned = str(text).strip()
                if not cleaned:
                    continue
                lines.append(cleaned)
                try:
                    confidences.append(float(confidence))
                except (TypeError, ValueError):
                    pass

            extracted_text = "\n".join(lines).strip()
            average_confidence = (
                sum(confidences) / len(confidences) if confidences else None
            )

            with get_sync_db() as db:
                job = db.execute(
                    select(ExtractionJob).where(ExtractionJob.id == job_uuid)
                ).scalar_one_or_none()
                if job:
                    job.ocr_engine = "easyocr"

                db.add(
                    ExtractedField(
                        document_id=document_uuid,
                        job_id=job_uuid,
                        field_name="ocr_text",
                        field_label="Texte OCR",
                        field_category="ocr",
                        raw_value=extracted_text,
                        ocr_value=extracted_text,
                        normalized_value=extracted_text,
                        data_type="text",
                        page_number=1,
                        confidence=average_confidence,
                    )
                )
                db.commit()

            logger.info(
                "[OCR] Completed job=%s lines=%d confidence=%s",
                job_id,
                len(lines),
                average_confidence,
            )

            return StageResult(
                stage_name="ocr",
                success=True,
                data={
                    **input_data,
                    "text": extracted_text,
                    "ocr_lines": lines,
                    "ocr_confidence": average_confidence,
                },
                metadata={
                    "engine": "easyocr",
                    "lines_count": len(lines),
                    "confidence": average_confidence,
                },
            )

        except Exception as e:
            logger.error("[OCR] Stage failed for job %s: %s", job_id, str(e), exc_info=True)
            return StageResult(
                stage_name="ocr",
                success=False,
                data=None,
                metadata={},
                error=str(e),
            )
