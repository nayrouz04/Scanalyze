""" 
app/api/v1/jobs.py - Extraction job endpoints

POST /jobs/                        - create a job (user clicks Next)
GET  /jobs/{job_id}                - get job details
"""

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.job import JobCreateRequest, JobResponse
from app.services.job_service import JobError, JobService

router = APIRouter()
logger = logging.getLogger(__name__)

def _job_error_to_http(e: JobError) -> HTTPException:
    """Convert a domain-level JobError to an HTTPException for API responses."""
    return HTTPException(status_code=e.status_code, detail=e.message)

#______ create job _______
@router.post(
    "/",
    response_model=JobResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an extraction job for (user clicks Next)",
)
async def create_job(
    data: JobCreateRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    
    """
    Triggered when the user clicks Next in the upload interface
    """
    if current_user.role != "user":
       raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only users can create jobs")
   
    try:
        service = JobService(db)
        job = await service.create_job(
            document_id=data.document_id,
            current_user=current_user,
        )
        await db.commit()
        logger.info("Job %s created for document %s ", job.id, data.document_id)
        return JobResponse.model_validate(job)
    except JobError as e:
        await db.rollback()
        raise _job_error_to_http(e)
    
#_____ get job _____
@router.get(
    "/{job_id}",
    response_model=JobResponse,
    summary="Get job details ",
)
async def get_job(
    job_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """ 
    Retrieve all job details
    Used after the pipeline is completed (status = "done")
    """ 
    try:
        service = JobService(db)
        job = await service.get_job(
            job_id=job_id,
            current_user=current_user,
        )
        return JobResponse.model_validate(job)
    except JobError as e:
        raise _job_error_to_http(e)
    

    




