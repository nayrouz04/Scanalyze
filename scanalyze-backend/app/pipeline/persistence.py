"""Database persistence stage.

This stage writes extracted fields into the relational database so the rest of
the application can validate, review, and export them.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict
from uuid import UUID

from sqlalchemy import select

from app.db.session import get_sync_db
from app.models.document import Document
from app.models.job import ExtractionJob
from app.models.result import ExtractedField
from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


class PersistenceStage(PipelineStage):
    """Persist normalized fields to the database."""

    def __init__(self) -> None:
        logger.info("[Pipeline] PersistenceStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            fields = input_data.get("fields") or []
            if not isinstance(fields, list):
                raise ValueError("fields must be a list")

            job_uuid = UUID(job_id)
            persisted = 0

            with get_sync_db() as db:
                job = db.execute(
                    select(ExtractionJob).where(ExtractionJob.id == job_uuid)
                ).scalar_one_or_none()
                if job is None:
                    raise ValueError(f"Job {job_id} not found")

                document = db.execute(
                    select(Document).where(Document.id == job.document_id)
                ).scalar_one_or_none()
                if document is None:
                    raise ValueError(f"Document for job {job_id} not found")

                for field in fields:
                    if not isinstance(field, dict):
                        continue
                    db.add(
                        ExtractedField(
                            id=uuid.uuid4(),
                            document_id=document.id,
                            job_id=job.id,
                            field_name=str(field.get("field_name")),
                            field_label=field.get("field_label"),
                            field_category=field.get("field_category"),
                            raw_value=self._to_text(field.get("raw_value")),
                            ocr_value=self._to_text(field.get("raw_value")),
                            normalized_value=self._to_text(field.get("normalized_value")),
                            data_type=field.get("data_type"),
                            page_number=field.get("page_number"),
                            bbox_x=field.get("bbox_x"),
                            bbox_y=field.get("bbox_y"),
                            bbox_w=field.get("bbox_w"),
                            bbox_h=field.get("bbox_h"),
                            confidence=field.get("confidence"),
                            is_validated=bool(field.get("is_grounded", False)),
                            is_skipped=False,
                        )
                    )
                    persisted += 1

                db.commit()

            return StageResult(
                stage_name="persistence",
                success=True,
                data={**input_data, "persisted_fields": persisted},
                metadata={
                    "persisted_fields": persisted,
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] PersistenceStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="persistence",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _to_text(self, value: Any) -> str | None:
        if value is None:
            return None
        if isinstance(value, str):
            return value
        return str(value)