"""
app/api/v1/documents.py – Document endpoints

POST /documents/upload    Upload a document (user only)
"""
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import CurrentUser, get_db
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentError, DocumentService

router = APIRouter()
logger = logging.getLogger(__name__)

def _document_error_to_http(e: DocumentError) -> HTTPException:
    """Convert a DocumentError into an HTTPException"""
    return HTTPException(status_code=e.status_code, detail=e.message)

#_______ Upload __________
@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a document (user ONLY)",
)
async def upload(
    file: Annotated[UploadFile, File(description="PDF, PNG, JPEG, JPG ou TIFF — max 5MB")],
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Upload a document to MinIO and save metadata in DB.
    - Allowed extensions : .pdf, .png, .jpeg, .jpg, .tiff
    - Max size : 5 MB
    - Role required : user
    """
    
    #_______ role verification ________ 
    if current_user.role != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only users can upload documents",
        )
    
    #_________ Service call ________
    try:
        #create the service with the DB session
        service = DocumentService(db)
        
        document = await service.upload_document(
            file=file,
            current_user=current_user,
        )
        return DocumentResponse(
            message="Document uploaded successfully",
            id=document.id,
            filename=document.filename,
            original_filename=document.original_filename,
            file_type=document.file_type,
            file_size=document.file_size,
            status=document.status,
            uploaded_at=document.uploaded_at,
        )
    except DocumentError as e:
        raise _document_error_to_http(e)
        


