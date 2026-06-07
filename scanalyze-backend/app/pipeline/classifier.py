"""
Document classification stage.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Dict, List

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class DocumentClassificationResult:
    doc_type: str
    confidence: float
    language: str | None = None
    evidence: List[str] | None = None


class DocumentClassificationStage(PipelineStage):
    """First-pass keyword-based classifier for backend extraction."""

    def __init__(self) -> None:
        logger.info("[Pipeline] DocumentClassificationStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            text = str(input_data.get("text", "")).strip()
            text = str(
                input_data.get("reconstructed_text")
                or input_data.get("normalized_text")
                or input_data.get("text", "")
            ).strip()
            if not text:
                raise ValueError("Missing OCR text for classification")

            doc_type, confidence, evidence = self._classify_document(text)

            return StageResult(
                stage_name="document_classification",
                success=True,
                data={**input_data, "doc_type": doc_type, "confidence": confidence},
                metadata={
                    "doc_type": doc_type,
                    "confidence": confidence,
                    "evidence": evidence,
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] DocumentClassificationStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="document_classification",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )

    def _classify_document(self, text: str) -> tuple[str, float, List[str]]:
        lowered = text.lower()
        evidence: List[str] = []
        score_map = {
            "invoice": ("invoice", "facture", "total", "vat", "tax", "amount due"),
            "cv": ("cv", "resume", "experience", "education", "skills", "linkedin"),
            "legal": ("contract", "agreement", "article", "clause", "law", "legal"),
        }

        best_type = "unknown"
        best_score = 0
        for doc_type, terms in score_map.items():
            score = sum(1 for term in terms if term in lowered)
            if score > best_score:
                best_type = doc_type
                best_score = score
                evidence = [term for term in terms if term in lowered]

        if best_score <= 0:
            return "unknown", 0.20, []

        confidence = min(0.99, 0.35 + best_score * 0.18)
        return best_type, confidence, evidence
