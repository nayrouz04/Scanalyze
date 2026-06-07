 # spaCy NER 
"""Analysis and text reconstruction stage"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List

from app.pipeline.base import PipelineStage, StageResult

logger = logging.getLogger(__name__)


class DocumentAnalysisStage(PipelineStage):
    """Normalize OCR lines into cleaner text blocks and paragraphs"""

    def __init__(self) -> None:
        logger.info("[Pipeline] DocumentAnalysisStage initialized")

    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        try:
            lines = input_data.get("lines") or []
            text = str(input_data.get("text", "")).strip()
            normalized_text = " ".join(text.split())
            reconstructed_paragraphs = self._reconstruct_paragraphs(lines, normalized_text)
            reconstructed_text = "\n\n".join(reconstructed_paragraphs).strip()
            return StageResult(
                stage_name="document_analysis",
                success=True,
                data={**input_data, "normalized_text": normalized_text, 
                      "reconstructed_paragraphs": reconstructed_paragraphs,
                      "reconstructed_text": reconstructed_text},
                metadata={
                    "normalized_length": len(normalized_text),
                    "paragraph_count": len(reconstructed_paragraphs),
                },
            )
        except Exception as exc:
            logger.error("[Pipeline] DocumentAnalysisStage failed: %s", exc, exc_info=True)
            return StageResult(
                stage_name="document_analysis",
                success=False,
                data=None,
                metadata={},
                error=str(exc),
            )
    
    def _reconstruct_paragraphs(self, lines: Any, normalized_text: str) -> List[str]:
        if not isinstance(lines, list) or not lines:
            return [normalized_text] if normalized_text else []

        paragraphs: List[str] = []
        current: List[str] = []

        for raw_line in lines:
            line = str(raw_line).strip()
            if not line:
                if current:
                    paragraphs.append(self._join_lines(current))
                    current = []
                continue

            if self._is_heading(line):
                if current:
                    paragraphs.append(self._join_lines(current))
                    current = []
                paragraphs.append(line)
                continue

            if line.startswith(("-", "•", "*")):
                if current:
                    paragraphs.append(self._join_lines(current))
                    current = []
                paragraphs.append(line)
                continue

            if current and current[-1].endswith("-"):
                current[-1] = current[-1][:-1] + line
            else:
                current.append(line)

        if current:
            paragraphs.append(self._join_lines(current))

        return [paragraph for paragraph in paragraphs if paragraph.strip()]

    def _join_lines(self, lines: List[str]) -> str:
        joined = " ".join(lines)
        joined = re.sub(r"\s+", " ", joined).strip()
        return joined

    def _is_heading(self, line: str) -> bool:
        if len(line) > 80:
            return False
        if line.isupper() and len(line.split()) <= 8:
            return True
        if re.match(r"^[A-Z][A-Za-z0-9\s&/,-]{1,60}$", line) and line.endswith(":"):
            return True
        return False