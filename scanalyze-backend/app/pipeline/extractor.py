
  # PaddleOCR(with fallback logic)
"""OCR extraction stage.
This stage: 
1 reads the preprocessed image from MinIO
2 runs PaddleOCR for extraction data if the engine is available, otherwise falls back to a simple image analysis
3 returns text/line/bbox data for later classification.


"""

from __future__ import annotations

import logging

from dataclasses import dataclass
from typing import Any, Dict, List
from uuid import UUID

import cv2
import numpy as np
from sqlalchemy import select

from app.config import get_settings
from app.db.session import get_sync_db
from app.models.job import ExtractionJob
from app.pipeline.base import PipelineStage, StageResult
from app.pipeline.preprocessor import load_image_from_minio

settings = get_settings()
logger = logging.getLogger(__name__)


@dataclass(slots=True)
class OCRExtractionResult:
    text: str #the extracted text content
    lines: List[str] # list of the detected text lines
    boxes: List[List[float]] # list of bounding boxes
    ocr_engine: str # the OCR engine used
    raw_ocr: Any | None = None


class OCRExtractionStage(PipelineStage):
    """Run OCR on the preprocessed image and persist OCR engine metadata.
    If PaddleOCR is available:
    -> perform actual text extraction.

    Otherwise:
    -> use a fallback mechanism.
    """

    def __init__(self) -> None:
        self._ocr_model = self._build_ocr_engine()
        logger.info("[Pipeline] OCRExtractionStage initialized")

    def _build_ocr_engine(self):
        try:
            from paddleocr import PaddleOCR  
            return PaddleOCR(use_angle_cls=True, lang="en")
        
        except Exception as exc:  # pragma: no cover - optional dependency
            logger.warning("[Pipeline] PaddleOCR unavailable: %s", exc)
            return None

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
          #retrieve document_id and minio_path from input_data
            document_id = input_data.get("document_id")
            minio_path = input_data.get("preprocessed_image_path") or input_data.get("minio_path")
            if not document_id or not minio_path:
                raise ValueError("Missing required input fields for OCR extraction")

            image = load_image_from_minio(minio_path,bucket=settings.S3_BUCKET_RESULTS )
            if image is None or not isinstance(image, np.ndarray) or image.size == 0:
                raise ValueError("Failed to load preprocessed image for OCR extraction")

            lines: List[str] = []
            boxes: List[List[float]] = []
            raw_ocr: Any | None = None

            #PaddleOCR disponible -> extraction
            if self._ocr_model is not None:
                raw_ocr = self._ocr_model.ocr(image, cls=True)
                for page in raw_ocr or []:
                    for item in page or []:
                        if not item or len(item) < 2:
                            continue
                        bbox, payload = item[0], item[1]
                        text = str(payload[0]).strip() if isinstance(payload, (list, tuple)) and payload else str(payload).strip()
                        if text:
                            lines.append(text)
                        if isinstance(bbox, (list, tuple)) and len(bbox) >= 4:
                            flat_box: List[float] = []
                            for point in bbox[:4]:
                                if isinstance(point, (list, tuple)) and point:
                                    flat_box.append(float(point[0]))
                                else:
                                    flat_box.append(float(point))
                            boxes.append(flat_box)
                ocr_engine = "paddleocr"
                
            #fallback -> simple image analysis
            else:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                mean_val = float(np.mean(gray)) if gray.size else 0.0
                lines = [f"preprocessed_image_mean_intensity={mean_val:.2f}"]
                ocr_engine = "fallback"

            text = "\n".join(lines).strip()

            with get_sync_db() as db:
                job = db.execute(
                    select(ExtractionJob).where(ExtractionJob.id == UUID(job_id))
                ).scalar_one_or_none()
                if job is not None:
                    job.ocr_engine = ocr_engine
                    db.commit()

            return StageResult(
                stage_name="ocr_extraction",
                success=True,
                data={
                    **input_data,
                    "document_id": document_id,
                    "minio_path": minio_path,
                    "preprocessed_image_path": minio_path,
                    "text": text,
                    "lines": lines,
                    "boxes": boxes,
                    "ocr_engine": ocr_engine,
                    "raw_ocr": raw_ocr,
                },
                metadata={
                    "ocr_engine": ocr_engine,
                    "line_count": len(lines),
                    "box_count": len(boxes),
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] OCRExtractionStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="ocr_extraction",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )
