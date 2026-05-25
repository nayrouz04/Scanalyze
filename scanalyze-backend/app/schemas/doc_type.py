"""
app/schemas/doc_type.py - Pydantic schemas for document types
"""
import uuid
from datetime import datetime
from pydantic import BaseModel, Field

class DocTypeCreateRequest(BaseModel):
    """What the admin sends to create a document type"""
    name: str = Field(min_length=2, max_length=100)

class DocTypeResponse(BaseModel):
    """What the API returns for each document type"""
    id: uuid.UUID
    name: str
    created_at: datetime
    
    model_config = {"from_attributes": True} 

class DocTypeUpdateRequest(BaseModel):
    """What the admin sends to update a document type"""
    name: str = Field(min_length=2, max_length=100)
