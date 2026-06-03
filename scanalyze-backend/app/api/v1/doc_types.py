"""
app/api/v1/doc_types.py – Document type endpoints

POST /doc-types/   → Create a document type (admin only)
GET  /doc-types/         → List all document types (user + admin + pipeline)
DELETE /doc-types/{id}   → Delete a document type (admin only)
PATCH /doc-types/{id}    → Update a document type (admin only)
"""

import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_db
from app.schemas.doc_type import DocTypeCreateRequest, DocTypeResponse, DocTypeUpdateRequest
from app.services.doc_type_service import DocTypeError, DocTypeService
from app.schemas.auth import MessageResponse

router = APIRouter()
logger = logging.getLogger(__name__)

def _doc_type_error_to_http(e : DocTypeError) -> HTTPException:
    """Convert a domain-level DocTypeError to an HTTPException for the API response."""
    return HTTPException(status_code=e.status_code, detail=e.message)

#_____ create doc type (admin only) _____
@router.post(
    "/",
    response_model=DocTypeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a document type (admin only)",
)
async def create_doc_type(
    data: DocTypeCreateRequest,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """ 
    Triggered when the admin clicks on "Create Type".
    Creates a new document type in the database.
    - Only the admin can create a document type
    - The document type must be unique
    """
    #_____ Role verification _____
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create document types",
        )
        
    try:
        service = DocTypeService(db)
        doc_type = await service.create_doc_type(data)
        await db.commit()
        return DocTypeResponse.model_validate(doc_type)
    except DocTypeError as e:
        await db.rollback()
        raise _doc_type_error_to_http(e)

#____ get all doc types _____
@router.get(
    "/",
    response_model=list[DocTypeResponse],
    summary="List all document types (user + admin + pipeline)",
)
async def list_doc_types(
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Get a list of all document types.
    - Used by the frontend to display the list
    - Used by the AI pipeline to classify documents
    """
    try:
        service = DocTypeService(db)
        doc_types = await service.get_all_doc_types()
        return [DocTypeResponse.model_validate(dt) for dt in doc_types]
    except DocTypeError as e:
        raise _doc_type_error_to_http(e)

#____ delete doc type _____
@router.delete(
    "/{doc_type_id}",
    response_model=MessageResponse,
    summary="Delete a document type (admin only)",
)
async def delete_doc_type(
    doc_type_id: uuid.UUID,
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Deletes a document type.
    Documents that had this type → doc_type = "others".
    Only the admin can delete a document type.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete document types",
        )
    try:
        service = DocTypeService(db)
        doc_type = await service.delete_doc_type(doc_type_id)
        await db.commit()
        return MessageResponse(
            message=f"Document type '{doc_type.name}' deleted successfully"
        )
    except DocTypeError as e:
        await db.rollback()
        raise _doc_type_error_to_http(e)
    
#____ update doc type _____
@router.patch(
    "/{doc_type_id}",
    response_model=DocTypeResponse,
    summary="Update a document type (admin only)",
)
async def update_doc_type(
    doc_type_id: uuid.UUID,
    # id du type à modifier → extrait depuis l'URL
    data: DocTypeUpdateRequest,
    # { "name": "nouveau_nom" }
    current_user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
): 
    """
    Updates the name of a document type.
    Documents that had the old type are automatically updated.
    Only the admin can update a document type.
    """ 
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update document types",
        )
    try:
        service = DocTypeService(db)
        doc_type = await service.update_doc_type(doc_type_id, data)
        await db.commit()
        return DocTypeResponse.model_validate(doc_type)
    except DocTypeError as e:
        await db.rollback()
        raise _doc_type_error_to_http(e)