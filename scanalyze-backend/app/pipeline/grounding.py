from __future__ import annotations

import logging
import re
from typing import Any, Dict, List

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


class GroundingStage(PipelineStage):
    """Validate extracted fields against the OCR source text."""

    def __init__(self) -> None:
        logger.info("[Pipeline] GroundingStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            text = str(
                input_data.get("reconstructed_text")
                or input_data.get("normalized_text")
                or input_data.get("text")
                or ""
            )
            fields = input_data.get("fields") or []
            grounded_fields = []

            for field in fields:
                if not isinstance(field, dict):
                    continue
                value = field.get("normalized_value") if field.get("normalized_value") is not None else field.get("raw_value")
                grounded = self._is_grounded(text, value)
                grounded_field = {**field, "is_grounded": grounded}
                grounded_fields.append(grounded_field)

            return StageResult(
                stage_name="grounding",
                success=True,
                data={**input_data, "fields": grounded_fields},
                metadata={
                    "grounded_count": sum(1 for item in grounded_fields if item.get("is_grounded")),
                    "field_count": len(grounded_fields),
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] GroundingStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="grounding",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _is_grounded(self, text: str, value: Any) -> bool:
        if value is None:
            return True
        candidate = str(value).strip()
        if len(candidate) < 3:
            return True
        normalized_text = self._normalize(text)
        normalized_value = self._normalize(candidate)
        if normalized_value in normalized_text:
            return True
        return normalized_value[:10] in normalized_text or normalized_value[-10:] in normalized_text

    def _normalize(self, text: str) -> str:
        return re.sub(r"[^a-z0-9]", "", text.lower())