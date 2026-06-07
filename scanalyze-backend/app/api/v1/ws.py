""" 
app/api/v1/ws.py - WebSocket endpoints
WS /ws/jobs/{job_id}?token=xxx
"""

import logging
import uuid

import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from jose import JWTError
from sqlalchemy import select

from app.core.security import decode_access_token
from app.db.session import AsyncSessionLocal
from app.models.job import ExtractionJob


router = APIRouter()
logger = logging.getLogger(__name__)

#_______Stage weights - average time _________

STAGE_WEIGHTS = {
    "queued":        {"status": "Waiting...",     "elapsed_target": 0},
    "OCR Processing":{"status": "OCR Processing", "elapsed_target": 30} ,
    "ai_running":    {"status": "AI Analysis",           "elapsed_target": 60},
    "done":          {"status": "Processing Completed!", "elapsed_target": None},
    "failed":        {"status": "Processing Failed",     "elapsed_target": None},
}
STAGE_PROGRESS_RANGE = {
    "queued":      (0,   5),
    "ocr_running": (5,  50),
    "ai_running":  (50, 95),
    "done":        (100, 100),
    "failed":      (0,   0),
}

def compute_progress(job: ExtractionJob) -> int:
    """Calculate dynamic progress based on elapsed time since job started."""
    status = job.status

    if status == "done":
        return 100
    if status == "failed":
        return 0
    if status == "queued" or job.started_at is None:
        return 2
    #Time since the job started
    now = datetime.now(timezone.utc)
    elapsed = (now - job.started_at).total_seconds()

    stage_info = STAGE_WEIGHTS.get(status, {})
    target = stage_info.get("elapsed_target", 60)

    range_min, range_max = STAGE_PROGRESS_RANGE.get(status, (0, 100))

    ratio = min(elapsed / max(target, 1), 0.95)

    return int(range_min + ratio * (range_max - range_min))

#________ WebSocket endpoint _________
@router.websocket("/jobs/{job_id}")
async def job_status_ws(
    websocket: WebSocket,
    job_id: uuid.UUID,
    token: str = Query(...),
):
    # verify token JWT 
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:  
            await websocket.close(code=4001, reason="Invalid token")
            return
    except JWTError:
        #if the token is invalid or expired, close the connection with an JWTError
        await websocket.close(code=4001, reason="Invalid token")
        return
    
    # Accept the WebSocket connection
    await websocket.accept()
    logger.info("WebSocket connection accepted for job: %s", job_id) 
    
    #verify if the job belongs to the user and exists in DB
    async with AsyncSessionLocal() as db:
        job_result = await db.execute(
            select(ExtractionJob).where(ExtractionJob.id == job_id)
        )
        job = job_result.scalar_one_or_none()
        
        if job is None:
            await websocket.send_json({
                "status": "Error",
                "progress": 0,
                "message": "Job not found"
            })
            await websocket.close(code=4004, reason="Job not found")
            return
        
        if str(job.triggered_by) != user_id:
            await websocket.send_json({
                "status": "Error",
                "progress": 0,
                "message": "You are not allowed to access this job"
            })
            await websocket.close(code=4003, reason="Forbidden")
            return
        
    #Send the status in real time
    try:
        while True:
            async with AsyncSessionLocal() as db:
                
                # Retrieve the current job status
                job_result = await db.execute(
                    select(ExtractionJob).where(ExtractionJob.id == job_id)
                )
                job = job_result.scalar_one_or_none()
                if job is None:
                    break
                    
                current_status = job.status
                progress = compute_progress(job)
                label = STAGE_WEIGHTS.get(current_status, {}).get("label", current_status)
                
                await websocket.send_json({
                    "status": label,
                    "progress": progress,
                    "job_id": str(job_id),
                })
                logger.info(
                    "WebSocket — job=%s status=%s progress=%d%%",
                    job_id, current_status, progress
                )
                
                # Close the WebSocket if the job is completed  
                if current_status in ("done", "failed"):
                    logger.info(
                        "WebSocket closing for job %s -> status: %s",
                        job_id, current_status
                    )
                    await websocket.close()
                    return
                
            await asyncio.sleep(1)  # Poll every 1 second
        
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected for job: %s", job_id)
    
    
    
    
    
    
    