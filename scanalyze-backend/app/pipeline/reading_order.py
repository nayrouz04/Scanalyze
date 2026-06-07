"""Reading order stage.

This stage orders layout regions from top-to-bottom, left-to-right so later
OCR and extraction stages can consume a consistent document flow.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)

@dataclass(slots=True)
class OrderedRegion:
    region_type: str
    bbox: list[float]
    confidence: float
    reading_order: int


class ReadingOrderStage(PipelineStage):
    """Sort layout regions into a stable reading order."""

    def __init__(self) -> None:
        logger.info("[Pipeline] ReadingOrderStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            layout = input_data.get("layout") or {}
            regions = layout.get("regions") or []
            if not isinstance(regions, list):
                raise ValueError("layout.regions must be a list")

            ordered = sorted(
                [
                    r
                    for r in regions
                    if isinstance(r, dict) and isinstance(r.get("bbox"), list) and len(r["bbox"]) >= 4
                ],
                key=self._sort_key,
            )

            normalized = [
                OrderedRegion(
                    region_type=str(region.get("region_type", "text_block")),
                    bbox=[float(value) for value in region["bbox"][:4]],
                    confidence=float(region.get("confidence", 0.0) or 0.0),
                    reading_order=index,
                )
                for index, region in enumerate(ordered)
            ]

            return StageResult(
                stage_name="reading_order",
                success=True,
                data={
                    **input_data,
                    "reading_order": [
                        {
                            "region_type": item.region_type,
                            "bbox": item.bbox,
                            "confidence": item.confidence,
                            "reading_order": item.reading_order,
                        }
                        for item in normalized
                    ],
                },
                metadata={
                    "region_count": len(normalized),
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] ReadingOrderStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="reading_order",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _sort_key(self, region: Dict[str, Any]) -> tuple[float, float]:
        x, y = region["bbox"][0], region["bbox"][1]
        return float(y), float(x)