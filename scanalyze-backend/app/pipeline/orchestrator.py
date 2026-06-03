# File: app/pipeline/orchestrator.py

"""
Pipeline orchestrator.

The orchestrator is the "conductor" of the pipeline. It:
1. Chains all stages in the correct order
2. Passes data from one stage to the next
3. Handles errors
4. Returns the final result
"""
import logging
from typing import Any, Dict, List
from uuid import UUID

from app.pipeline.base import StageResult
from app.pipeline.extractor import OCRExtractionStage
from app.pipeline.preprocessor import PreprocessingStage

logger = logging.getLogger(__name__)

# CLASSE: PipelineOrchestrator
class PipelineOrchestrator:
    """
    Orchestrates all pipeline stages in order.
    """

    def __init__(self):
        # List of all stages in the pipeline, in order
        self.stages: List[Any] = [
            PreprocessingStage(),      # Stage 1: Clean the image
            OCRExtractionStage(),      # Stage 2: Extract text
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
        results = {}

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

                # Check if stage failed
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
