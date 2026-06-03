"""
app/models/document.py – Document ORM model
"""

from __future__ import annotations
from typing import TYPE_CHECKING

import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
if TYPE_CHECKING:
    from app.models.result import ExtractedField, Result
    from app.models.job import ExtractionJob
    from app.models.user import User
    from app.models.doc_type import DocumentType

class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    DONE = "done"

class Document(Base):
    __tablename__ = "documents"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=False
    )
    
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)   # pdf, png ...
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)    
    minio_path: Mapped[str] = mapped_column(String(500), nullable=False)  #  MinIO path
    pages: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # Number of pages in the document, image (PNG, JPG, JPEG, TIFF)=> always 1 page
    doc_number: Mapped[int] = mapped_column(Integer, nullable=False, default=0) 

    doc_type_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("doc_types.id", ondelete="SET NULL"),
        nullable=True,
    )
    
    status: Mapped[str] = mapped_column( # document status
        String(20),
        nullable=False,
        default=DocumentStatus.UPLOADED.value  
    )
    confidence_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
        default=None
        )  # Overall confidence score for the document
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False) 
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)  # Timestamp for when the document was deleted
    deleted_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    #relationship 
    user: Mapped["User |None"] = relationship("User", back_populates="documents", foreign_keys="[Document.user_id]")
    document_type: Mapped["DocumentType | None"] = relationship("DocumentType", back_populates="documents")
    jobs: Mapped[list["ExtractionJob"]] = relationship(
        "ExtractionJob", back_populates="document", cascade="all, delete-orphan"
    )
    extracted_fields: Mapped[list["ExtractedField"]] = relationship(
        "ExtractedField", back_populates="document", cascade="all, delete-orphan"
    )
    results: Mapped[list["Result"]] = relationship(
        "Result", back_populates="document", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Document id={self.id} filename={self.filename} user_id={self.user_id}>"
    
