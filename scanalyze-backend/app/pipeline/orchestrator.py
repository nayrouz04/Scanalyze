# File: app/pipeline/orchestrator.py

"""
Pipeline orchestrator.

The orchestrator is the "conductor" of the pipeline. It:
1. Chains all stages in the correct order
2. Passes data from one stage to the next
3. Handles errors
4. Returns the final result
"""
from __future__ import annotations
import logging
from typing import Any, Dict, List
from uuid import UUID

from app.pipeline.base import PipelineStage, StageResult
from app.pipeline.layout import LayoutDetectionStage
from app.pipeline.reading_order import ReadingOrderStage
from app.pipeline.table_handling import TableHandlingStage
from app.pipeline.preprocessor import PreprocessingStage
from app.pipeline.extractor import OCRExtractionStage
from app.pipeline.classifier import DocumentClassificationStage
from app.pipeline.analyser import DocumentAnalysisStage
from app.pipeline.structured_extractor import StructuredExtractionStage
from app.pipeline.grounding import GroundingStage
from app.pipeline.normalizer import BusinessNormalizationStage
from app.pipeline.persistence import PersistenceStage


logger = logging.getLogger(__name__)

# CLASSE: PipelineOrchestrator
class PipelineOrchestrator:
    """
    Orchestrates all pipeline stages in order.
    """
    
    def __init__(self):
        # List of all stages in the pipeline, in order
        self.stages: List[PipelineStage] = [
            PreprocessingStage(),        # Stage 1: Clean the image
            LayoutDetectionStage(),       # Stage 2: Detect layout regions
            ReadingOrderStage(),          # Stage 3: Order regions logically
            TableHandlingStage(),         # Stage 4: Normalize table regions
            OCRExtractionStage(),         # Stage 5: OCR on the preprocessed image
            DocumentClassificationStage(),# Stage 6: Classify the document type
            DocumentAnalysisStage(),      # Stage 7: Reconstruct / normalize text
            StructuredExtractionStage(),  # Stage 8: Extract structured fields
            GroundingStage(),             # Stage 9: Validate extracted values
            BusinessNormalizationStage(), # Stage 10: Normalize field values
            PersistenceStage(),           # Stage 11: Save extracted fields to DB
        ]
        logger.info(
            "[Pipeline] Orchestrator initialized with %d stages: %s",
            len(self.stages),
            ", ".join(stage.__class__.__name__ for stage in self.stages)
        )
    
    async def run(self,
                  job_id: UUID,
                  document_id: UUID,
                  minio_path: str
    ) -> Dict[str, Any]:
        """
        Run the entire pipeline in order.
        """
        logger.info(
            "[Pipeline] Starting — job=%s document=%s path=%s",
            job_id, document_id, minio_path
        )
        
        # Step 1: Prepare initial data
        # This is the data that will be passed between stages
        current_data = {
            "document_id": str(document_id),
            "minio_path": minio_path
        }
        results: Dict[str, Any] = {}
        
        # Step 2: Loop over all stages
        for index, stage in enumerate(self.stages, 1):
            stage_name = stage.__class__.__name__
            
            try:
                logger.info(
                    "[Pipeline] Stage %d/%d: %s",
                    index, len(self.stages), stage_name
                )
                
                result: StageResult = await stage.execute(
                    input_data=current_data,
                    job_id=str(job_id)
                )
                
                # Store the result
                results[result.stage_name] = {
                    "success": result.success,
                    "metadata": result.metadata
                }
                
                # stop immediately if stage failed
                if not result.success:
                    logger.error(
                        "[Pipeline] Stage %s FAILED: %s",
                        stage_name, result.error
                    )
                    return {
                        "success": False,
                        "failed_stage": result.stage_name,
                        "error": result.error,
                        "results": results
                    }
                
                # Stage succeeded! Prepare data for next stage
                current_data = result.data
                logger.info("[Pipeline] Stage %s completed", stage_name)
            
            except Exception as e:
                logger.error(
                    "[Pipeline] Stage %s CRASHED: %s",
                    stage_name, str(e), exc_info=True
                )
                return {
                    "success": False,
                    "failed_stage": stage_name,
                    "error": str(e),
                    "results": results
                }
        logger.info("[Pipeline] All stages completed — job=%s", job_id)
        return {
            "success": True,
            "results": results,
            "final_data": current_data
        }
