"""Table handling stage.

This stage isolates table-like regions from the layout information and prepares
them in a normalized form for the structured extraction step.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class TableRegion:
    bbox: list[float]
    confidence: float
    row_count: int
    column_count: int


class TableHandlingStage(PipelineStage):
    """Collect and normalize table-like layout regions."""

    def __init__(self) -> None:
        logger.info("[Pipeline] TableHandlingStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            layout = input_data.get("layout") or {}
            regions = layout.get("regions") or []
            if not isinstance(regions, list):
                raise ValueError("layout.regions must be a list")

            table_regions = []
            for region in regions:
                if not isinstance(region, dict):
                    continue
                if region.get("region_type") not in {"table_like", "table", "table_block"}:
                    continue
                bbox = region.get("bbox")
                if not isinstance(bbox, list) or len(bbox) < 4:
                    continue
                table_regions.append(
                    TableRegion(
                        bbox=[float(value) for value in bbox[:4]],
                        confidence=float(region.get("confidence", 0.0) or 0.0),
                        row_count=int(region.get("row_count", 0) or 0),
                        column_count=int(region.get("column_count", 0) or 0),
                    )
                )

            return StageResult(
                stage_name="table_handling",
                success=True,
                data={
                    **input_data,
                    "tables": [
                        {
                            "bbox": table.bbox,
                            "confidence": table.confidence,
                            "row_count": table.row_count,
                            "column_count": table.column_count,
                        }
                        for table in table_regions
                    ],
                },
                metadata={
                    "table_count": len(table_regions),
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] TableHandlingStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="table_handling",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )