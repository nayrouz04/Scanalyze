"""Layout detection stage.

This stage analyses the preprocessed image to identify coarse document
structure such as text blocks, table-like regions, and reading order hints.
The output is intentionally lightweight so later OCR/extraction stages can
reuse it without being tightly coupled to a specific layout library.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict
from uuid import UUID

import cv2
import numpy as np
from sqlalchemy import select

from app.config import get_settings
from app.db.session import get_sync_db
from app.models.job import ExtractionJob
from app.pipeline.base import PipelineStage, StageResult
from app.pipeline.preprocessor import load_image_from_minio

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class LayoutRegion:
    region_type: str
    bbox: list[float]
    confidence: float
    reading_order: int

class LayoutDetectionStage(PipelineStage):
    """Detect coarse layout regions from the preprocessed image."""

    def __init__(self) -> None:
        logger.info("[Pipeline] LayoutDetectionStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            document_id = input_data.get("document_id")
            minio_path = input_data.get("preprocessed_image_path") or input_data.get("minio_path")
            if not document_id or not minio_path:
                raise ValueError("Missing required input fields for layout detection")

            settings = get_settings()
            bucket = input_data.get("preprocessed_bucket") or settings.S3_BUCKET_RESULTS
            image = load_image_from_minio(minio_path, bucket=bucket)
            if image is None or not isinstance(image, np.ndarray) or image.size == 0:
                raise ValueError("Failed to load preprocessed image for layout detection")

            height, width = image.shape[:2]
            regions = self._detect_regions(image)
            table_like = sum(1 for region in regions if region.region_type == "table_like")
            text_blocks = sum(1 for region in regions if region.region_type == "text_block")

            with get_sync_db() as db:
                job = db.execute(
                    select(ExtractionJob).where(ExtractionJob.id == UUID(job_id))
                ).scalar_one_or_none()
                if job is not None:
                    job.ai_model = job.ai_model or "layout_detector"
                    db.commit()

            return StageResult(
                stage_name="layout_detection",
                success=True,
                data={
                    **input_data,
                    "document_id": document_id,
                    "preprocessed_image_path": minio_path,
                    "layout": {
                        "image_size": {"width": width, "height": height},
                        "regions": [
                            {
                                "region_type": region.region_type,
                                "bbox": region.bbox,
                                "confidence": region.confidence,
                                "reading_order": region.reading_order,
                            }
                            for region in regions
                        ],
                        "text_block_count": text_blocks,
                        "table_like_count": table_like,
                    },
                },
                metadata={
                    "region_count": len(regions),
                    "text_block_count": text_blocks,
                    "table_like_count": table_like,
                    "image_width": width,
                    "image_height": height,
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] LayoutDetectionStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="layout_detection",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _detect_regions(self, image: np.ndarray) -> list[LayoutRegion]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        binary = cv2.adaptiveThreshold(
            blurred,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            31,
            15,
        )

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 5))
        dilated = cv2.dilate(binary, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        regions: list[LayoutRegion] = []
        area_threshold = max(500, int(image.shape[0] * image.shape[1] * 0.001))

        for idx, contour in enumerate(sorted(contours, key=lambda c: cv2.boundingRect(c)[1])):
            x, y, w, h = cv2.boundingRect(contour)
            area = w * h
            if area < area_threshold:
                continue

            aspect_ratio = w / max(1, h)
            region_type = "table_like" if aspect_ratio > 2.2 and h < image.shape[0] * 0.35 else "text_block"
            confidence = 0.55 if region_type == "text_block" else 0.70
            regions.append(
                LayoutRegion(
                    region_type=region_type,
                    bbox=[float(x), float(y), float(w), float(h)],
                    confidence=confidence,
                    reading_order=idx,
                )
            )

        if not regions:
            width = image.shape[1]
            height = image.shape[0]
            regions.append(
                LayoutRegion(
                    region_type="full_page",
                    bbox=[0.0, 0.0, float(width), float(height)],
                    confidence=0.30,
                    reading_order=0,
                )
            )

        return regions