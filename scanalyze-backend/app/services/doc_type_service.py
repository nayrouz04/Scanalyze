""" 
app/services/doc_type_service.py - Document type business logic
Handles creation and retrieval of document types
"""
import logging
import uuid

from sqlalchemy import select, update
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.doc_type import DocumentType
from app.schemas.doc_type import DocTypeCreateRequest, DocTypeUpdateRequest
from app.models.document import Document
from app.constants.document_constants import OTHERS_DOC_TYPE_ID, OTHERS_DOC_TYPE_NAME


logger = logging.getLogger(__name__)

class DocTypeError(Exception):
    """Domain-level doc type error — converted to HTTP response in the router."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)
        
class DocTypeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    #create doc type 
    async def create_doc_type(
        self,
        data: DocTypeCreateRequest,
    ) -> DocumentType:
        """
        Creates a new document type.
        Checks that the document type does not already exist (unique).
        Triggered when the admin clicks on "Create Type".
        """
        
        #verify that the document type name is unique
        existing = await self.db.execute(
            select(DocumentType).where(
                DocumentType.name == data.name.lower().strip()
            )
        )
        if existing.scalar_one_or_none():
            raise DocTypeError(
                f"Document type '{data.name}' already exists.",
                status.HTTP_409_CONFLICT
            )
        
        #create the type 
        doc_type = DocumentType(
            id=uuid.uuid4(),
            name=data.name.lower().strip(),
        )
        self.db.add(doc_type)
        await self.db.flush()
        
        logger.info("Document type created: %s", doc_type.name)
        return doc_type
    
    #get all doc types
    async def get_all_doc_types(self) -> list[DocumentType]:
        """
        Returns all document types.
        Used by:
        - The frontend → to display the list of document types
        - The AI pipeline → to compare the document with the list
        """
        result = await self.db.execute(
            select(DocumentType).order_by(DocumentType.name.asc())
        )
        return result.scalars().all()
       
    #delete doc type 
    async def delete_doc_type(
        self, 
        doc_type_id: uuid.UUID,
    ) -> DocumentType:
        """ 
        Deletes a document type.
        Documents that had this type → doc_type = "others".
        Triggered when the admin clicks on "Delete".
        """
        #verify that the document type exists
        result = await self.db.execute(
            select(DocumentType).where(DocumentType.id == doc_type_id)
        )
        doc_type = result.scalar_one_or_none()
        if doc_type is None:
            raise DocTypeError("Document type not found", status.HTTP_404_NOT_FOUND)
        
        if doc_type.name == OTHERS_DOC_TYPE_NAME:
            raise DocTypeError("Cannot delete the 'autres' type", status.HTTP_400_BAD_REQUEST)
        
        #doc points to the doc_type "autres"
        await self.db.execute(
            update(Document)
            .where(Document.doc_type_id == doc_type_id)
            .values(doc_type_id=OTHERS_DOC_TYPE_ID)
        )
        #delete the document type
        await self.db.delete(doc_type)
        await self.db.flush()
        logger.info("Document type deleted: %s", doc_type.name)
        return doc_type
    
    #update doc type
    async def update_doc_type(
        self,
        doc_type_id: uuid.UUID,
        data: "DocTypeUpdateRequest",
    ) -> DocumentType:
        """
        Updates the name of a document type.
        Documents that had the old type are automatically updated.
        Triggered when the admin edits a document type.
        """
        #verify that the document type exists
        result = await self.db.execute(
            select(DocumentType).where(DocumentType.id == doc_type_id)
        )
        doc_type = result.scalar_one_or_none()
        if doc_type is None:
            raise DocTypeError("Document type not found", status.HTTP_404_NOT_FOUND)
        
        if doc_type.name == OTHERS_DOC_TYPE_NAME:
            raise DocTypeError("Cannot update the 'autres' type", status.HTTP_400_BAD_REQUEST)
        
        #verify that the new name is unique
        existing = await self.db.execute(
            select(DocumentType).where(
                DocumentType.name == data.name.lower().strip(),
                DocumentType.id != doc_type_id
            )
        )
        if existing.scalar_one_or_none():
            raise DocTypeError(
                f"Document type '{data.name}' already exists.",
                status.HTTP_409_CONFLICT
            )
        old_name = doc_type.name
        doc_type.name = data.name.lower().strip()

        await self.db.flush()
        logger.info(
            "Document type updated: %s → %s",
            old_name,doc_type.name
        )
        return doc_type