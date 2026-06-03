# File: app/pipeline/__init__.py
"""
Pipeline orchestration and stages.

This module contains:
- base.py: Abstract base class for stages (PipelineStage, StageResult)
- preprocessor.py: Preprocessing stage implementation
- orchestrator.py: Pipeline orchestrator (runs all stages)
- Other stages: To be implemented (classifier, extractor, analyser, etc.)
"""

from app.pipeline.orchestrator import PipelineOrchestrator
from app.pipeline.base import PipelineStage, StageResult
from app.pipeline.preprocessor import PreprocessingStage

__all__ = [
    "PipelineOrchestrator",
    "PipelineStage",
    "StageResult",
    "PreprocessingStage",
]
