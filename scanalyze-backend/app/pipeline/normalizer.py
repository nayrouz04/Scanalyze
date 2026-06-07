from __future__ import annotations

import logging
import re
from typing import Any, Dict

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


class BusinessNormalizationStage(PipelineStage):
    """Normalize extracted fields into a consistent business format."""

    def __init__(self) -> None:
        logger.info("[Pipeline] BusinessNormalizationStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            fields = input_data.get("fields") or []
            normalized_fields = []
            for field in fields:
                if not isinstance(field, dict):
                    continue
                normalized_fields.append(self._normalize_field(field))

            return StageResult(
                stage_name="business_normalization",
                success=True,
                data={**input_data, "fields": normalized_fields},
                metadata={
                    "field_count": len(normalized_fields),
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] BusinessNormalizationStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="business_normalization",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _normalize_field(self, field: Dict[str, Any]) -> Dict[str, Any]:
        value = field.get("normalized_value")
        if value is None:
            value = field.get("raw_value")
        normalized = value

        if isinstance(value, str):
            normalized = value.strip()
            if self._looks_like_email(normalized):
                normalized = normalized.lower()
            elif self._looks_like_phone(normalized):
                normalized = self._normalize_phone(normalized)
            elif self._looks_like_amount(normalized):
                normalized = self._normalize_amount(normalized)
            elif self._looks_like_date(normalized):
                normalized = self._normalize_date(normalized)

        return {**field, "normalized_value": normalized}

    def _looks_like_email(self, value: str) -> bool:
        return "@" in value

    def _looks_like_phone(self, value: str) -> bool:
        digits = re.sub(r"\D", "", value)
        return 7 <= len(digits) <= 20

    def _looks_like_amount(self, value: str) -> bool:
        return bool(re.search(r"\d+[.,]\d+|\d+", value))

    def _looks_like_date(self, value: str) -> bool:
        return bool(re.search(r"\b\d{1,4}[/-]\d{1,2}[/-]\d{1,4}\b", value))

    def _normalize_phone(self, value: str) -> str:
        return re.sub(r"\s+", " ", value).strip()

    def _normalize_amount(self, value: str) -> str:
        cleaned = value.replace(" ", "")
        return cleaned

    def _normalize_date(self, value: str) -> str:
        return value.strip()