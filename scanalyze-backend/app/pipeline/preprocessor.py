
"""
app/pipeline/preprocessor.py - Preprocessing stage implementation.

This is the FIRST stage of the pipeline. It:
1. Loads the image from MinIO
2. Applies preprocessing (quality analysis + candidate generation)
3. Saves the best preprocessed image to MinIO
4. Updates the database
5. Returns the result to the next stage
"""

import logging
import uuid
from typing import Any, Dict
from io import BytesIO

import boto3
import cv2
import fitz  # PyMuPDF
import numpy as np
from botocore.exceptions import BotoCoreError, ClientError   
from sqlalchemy import select

from app.pipeline.base import PipelineStage, StageResult
from app.ocr_pipeline.preprocessing.pipeline import (
    DocumentPreprocessor,
    PreprocessingResult,
)
from app.config import get_settings, OCRPreprocessingConfig
from app.db.session import get_sync_db
from app.models.job import ExtractionJob
from app.services.document_service import get_s3_client

# Configure logging
logger = logging.getLogger(__name__)
settings = get_settings()

def load_image_from_minio(minio_path: str) -> np.ndarray:
    """ 
    load an image from MinIO and convert it to a numpy array
    """
    try:
        s3 = get_s3_client()
        #download the file from MinIO
        response = s3.get_object(
            Bucket=settings.S3_BUCKET_UPLOADS,
            Key=minio_path
        )
        file_bytes = response['Body'].read()
        ext = minio_path.rsplit(".", 1)[-1].lower()
        if ext == "pdf":
            pdf_doc = fitz.open(stream=file_bytes, filetype="pdf")
            if pdf_doc.page_count > 1:
                logger.warning(
                    "[Preprocessing] PDF has %d pages, processing only page 1",
                    pdf_doc.page_count
                )
                
            page = pdf_doc[0]
            mat = fitz.Matrix(200 / 72, 200 / 72)
            pix = page.get_pixmap(matrix=mat)
            #convert to numpy array
            image = np.frombuffer(pix.samples, dtype=np.uint8)
            image = image.reshape(pix.height, pix.width, pix.n)
            #convert to BGR for OpenCV
            if pix.n == 4:  # RGBA
                image = cv2.cvtColor(image, cv2.COLOR_RGBA2BGR)
            else:  # RGB
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        else:
            image_array = np.frombuffer(file_bytes, dtype=np.uint8)
            image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        if image is None or image.size == 0:
            raise ValueError(f"Failed to load image from MinIO: {minio_path}")
        return image
    
    except (BotoCoreError, ClientError) as e:
        raise ValueError(f"Failed to load image from MinIO: {str(e)}")

def save_image_to_minio(image: np.ndarray, minio_path: str) -> None:
    """ 
    Save a numpy array image to MinIO as PNG.
    used for saving the preprocessed image to vision-results bucket.
    """        
    try:
        success, image_bytes = cv2.imencode('.png', image)
        if not success:
            raise ValueError("Failed to encode image to PNG")

        image_bytes_io = BytesIO(image_bytes.tobytes())

        s3 = get_s3_client()
        s3.put_object(
            Bucket=settings.S3_BUCKET_RESULTS,
            # saves the results in a different bucket to separate them from the original uploads
            Key=minio_path,
            Body=image_bytes_io,
            ContentType="image/png",
        )
        logger.info("[Preprocessing] Image saved to MinIO: path=%s", minio_path) 
        
    except (BotoCoreError, ClientError) as e:
        raise ValueError(f"Failed to save image to MinIO: {str(e)}")
    
class PreprocessingStage(PipelineStage):
    """
    first stage of the pipeline:
    1. Loads the original image from MinIO
    2. Apply preprocessing (quality analysis + candidate generation)
    3. Save best candidate to MinIO (vision-results)
    4. Update job in DB with preprocessed_image_path
    5. Return result to next stage
    """
    
    def __init__(self):
        settings = get_settings()
        preprocessing_config = OCRPreprocessingConfig()
        self.preprocessor = DocumentPreprocessor(preprocessing_config)
        logger.info("[Preprocessing] PreprocessingStage initialized")
    
    async def execute(self, input_data: Dict[str, Any], job_id: str) -> StageResult:
        """
        Execute the preprocessing stage.
        """
        try:
            # STEP 1: Extract input data
            document_id = input_data.get("document_id")
            minio_path = input_data.get("minio_path")
            
            if not document_id or not minio_path:
                raise ValueError(
                    f"Missing required input fields 'document_id' or 'minio_path'. "
                    f"Got: {list(input_data.keys())}"
                )
            
            try:
                job_uuid = uuid.UUID(job_id)
            except ValueError:
                raise ValueError(f"Invalid job_id format: {job_id}")
            
            logger.info(
                "[Preprocessing] Starting — job=%s document=%s path=%s",
                job_id, document_id, minio_path
            )
            
            # STEP 2: Load image from MinIO
            image = load_image_from_minio(minio_path)
            logger.info(
                "[Preprocessing] Image loaded — shape=%s dtype=%s",
                image.shape, image.dtype
            )
            
            # STEP 3: Apply preprocessing
            preprocessing_result: PreprocessingResult = (
                self.preprocessor.process_with_metadata(image)
            )
            logger.info(
                "[Preprocessing] %d candidates generated",
                len(preprocessing_result.candidates)
            )
            
            # STEP 4: Extract best candidate information
            # Get the best candidate
            preprocessed_image = preprocessing_result.image  
            selected_candidate = preprocessing_result.selected_candidate
            candidate_name = selected_candidate.name  
            quality_score = selected_candidate.score  
            
            logger.info(
                "[Preprocessing] Selected candidate: %s (score: %.4f)",
                candidate_name, quality_score
            )
            
            # STEP 5: Save preprocessed image to MinIO
            preprocessed_minio_path = f"preprocessing/{job_id}/preprocessed.png"
            save_image_to_minio(preprocessed_image, preprocessed_minio_path)
            
            # STEP 6: Update database
            with get_sync_db() as db:
                job = db.execute(
                    select(ExtractionJob).where(ExtractionJob.id == job_uuid)
                ).scalar_one_or_none()

                if job:
                    # Sauvegarder uniquement le chemin MinIO
                    job.preprocessed_image_path = preprocessed_minio_path
                    db.commit()
                    logger.info(
                        "[Preprocessing] Database updated for job %s", job_id
                    )
                else:
                    logger.warning(
                        "[Preprocessing] Job %s not found in database", job_id
                    )
                    
            # STEP 7: Return result
            logger.info(
                "[Preprocessing] Stage completed successfully for job %s", job_id
            )
            
            return StageResult(
                stage_name="preprocessing",
                success=True,
                data={
                    "image": preprocessed_image, #numpy array of the preprocessed image, passed to the next stage for OCR  
                    "minio_path": preprocessed_minio_path,  
                    "document_id": document_id,  
                },
                metadata={
                    "selected_candidate": candidate_name,
                    "score": float(quality_score),
                    "candidates_count": len(preprocessing_result.candidates),
                }
            )
        
        except Exception as e:
            logger.error(
                "[Preprocessing] Stage failed for job %s: %s",
                job_id, str(e), exc_info=True
            )
            
            return StageResult(
                stage_name="preprocessing",
                success=False,
                data=None,
                metadata={},
                error=str(e)
            )
