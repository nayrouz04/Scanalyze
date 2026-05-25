"""
app/workers/tasks.py - Celery background tasks
This file contains the actual work that Celery executes in the background
when the user clicks Next in the upload interface

This file is the worker that:
-Updates the job status at each step
-Runs the AI pipeline (not implemented yet)
-Handles errors and retries
-Calculates the processing duration
"""

import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import select

from app.db.session import get_sync_db
from app.models.job import ExtractionJob
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

#_____ Main task
@celery_app.task(
    bind=True,
    
    max_retries=3, #If the pipeline fails, Celery automatically retries 3 times. After 3 failed attempts, the status is set to "failed".
    default_retry_delay=5, #Wait 5 seconds before retrying a failed task to avoid overwhelming the system with rapid retries.
    name="process_document",
)
def process_document(self, job_id: str, document_id: str):
    """ 
    Main pipeline task
    Triggered when FastAPI calls: process_document.delay(job_id, document_id)
    """
    
    #convert string IDs to UUID
    job_id = uuid.UUID(job_id)
    document_id = uuid.UUID(document_id)
    
    with get_sync_db() as db:
        try:
            #___1: Retrieve the job from the DB
            job = db.execute(
                select(ExtractionJob).where(ExtractionJob.id == job_id)
            ).scalar_one_or_none()
            
            if job is None:
                logger.error(f"Job {job_id} not found")
                return
            
            #Record the start of proceesing
            job.started_at = datetime.now(timezone.utc)
            job.status = "ocr_running"
            db.commit()
            
            #__2: Download the document from MinIO.
            # ToDO : implémenter le téléchargement depuis MinIO
            # document_bytes = download_from_minio(job.document.minio_path)
            logger.info("Downloading document %s from MinIO", document_id)
            
            #__3: Run the pipeline
            job.status = "ai_running"
            db.commit()
            # ToDO : implémenter le pipeline
            # from app.pipeline.orchestrator import run_pipeline
            # extracted_fields = run_pipeline(document_bytes, job_id, document_id)

            #__4: save the results
            # ToDO : sauvegarder les extracted_fields en DB
            # for field in extracted_fields:
            #     db.add(field)
            # db.commit()
            
            #__5: update job status to completed
            job.status = "done"
            # → frontend voit "Traitement terminé !"
            job.completed_at = datetime.now(timezone.utc)

            # Calculer la durée du traitement en millisecondes
            job.duration_ms = int(
                (job.completed_at - job.started_at).total_seconds() * 1000
            )
            db.commit()

            logger.info("Job %s completed successfully in %d ms", job_id, job.duration_ms)
        
        except Exception as e:
            logger.error("Job %s failed: %s", job_id, str(e))
            
            job.retry_count += 1
            
            if self.request.retries < self.max_retries:
                # The maximum number of retries has not been reached yet
                # → set the status back to "queued" and retry after 5s
                job.status = "queued"  
                db.commit()
                raise self.retry(exc=e, countdown=5)  
            
            else:
                # The maximum number of retries has been reached
                job.status = "failed"
                job.error_message = str(e)
                db.commit()
            
            
            

