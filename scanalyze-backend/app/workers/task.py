"""
app/workers/tasks.py - Celery background tasks
"""
import asyncio
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.db.session import get_sync_db
from app.models.job import ExtractionJob
from app.models.result import ExtractedField, Result  
from app.models.document import Document             
from app.models.user import User      
from app.pipeline.orchestrator import PipelineOrchestrator
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=5,
    name="process_document",
)
def process_document(self, job_id: str, document_id: str):
    """Main pipeline task."""

    job_uuid = uuid.UUID(job_id)
    document_uuid = uuid.UUID(document_id)

    with get_sync_db() as db:
        # 1. Retrieve job + document
        job = db.execute(
            select(ExtractionJob)
            .options(joinedload(ExtractionJob.document))
            .where(ExtractionJob.id == job_uuid)
        ).scalar_one_or_none()

        if job is None:
            logger.error("Job %s not found", job_uuid)
            return

        try:
            # 2. Start processing
            job.started_at = datetime.now(timezone.utc)
            job.status = "ocr_running"
            db.commit()

            minio_path = job.document.minio_path
            logger.info(
                "Starting pipeline for job=%s document=%s",
                job_uuid, document_uuid
            )

            # 3. Run the pipeline
            orchestrator = PipelineOrchestrator()
            pipeline_result = asyncio.run(
                orchestrator.run(
                    job_id=job_uuid,
                    document_id=document_uuid,
                    minio_path=minio_path
                )
            )

            # 4. Check pipeline result
            if not pipeline_result["success"]:
                raise Exception(
                    f"Pipeline failed at stage '{pipeline_result['failed_stage']}': "
                    f"{pipeline_result['error']}"
                )

            logger.info("Pipeline completed successfully for job=%s", job_uuid)

            # 5. Update job status to done
            job.status = "done"
            job.completed_at = datetime.now(timezone.utc)
            job.duration_ms = int(
                (job.completed_at - job.started_at).total_seconds() * 1000
            )
            db.commit()
            logger.info("Job %s completed in %d ms", job_uuid, job.duration_ms)

        except Exception as e:
            logger.error("Job %s failed: %s", job_uuid, str(e))
            job.retry_count += 1

            if self.request.retries < self.max_retries:
                job.status = "queued"
                db.commit()
                raise self.retry(exc=e, countdown=5)
            else:
                job.status = "failed"
                job.error_message = str(e)
                db.commit()