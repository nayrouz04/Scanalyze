"""
app/models/job.py - ExtractionJob ORM model
Represents a pipeline processing job for a document
"""
#This is the tracking ticket for the pipeline. Each time the user clicks on "Next", a record is created in this table to track the document processing status.
from __future__ import annotations
from typing import TYPE_CHECKING
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base
if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.result import ExtractedField, Result
    from app.models.user import User
    
class ExtractionJob(Base):
    __tablename__ = "extraction_jobs"
    
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False
    )
    
    #who declenched the job
    triggered_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    
    #the OCR engine used 
    ocr_engine: Mapped[str | None] = mapped_column(String(50), nullable=True)
    #the AI model used 
    ai_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    
    status: Mapped[str] = mapped_column(
        String(50), nullable=False, default="queued"
    )  # queued | ocr_running | ai_running | done | failed
    
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    
    #error handling
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)#nbr of times the job was retried after failure 
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    #relationships
    document: Mapped["Document"] = relationship("Document", back_populates="jobs")
    user: Mapped["User"] = relationship("User", back_populates="jobs")
    extracted_fields: Mapped[list["ExtractedField"]] = relationship(
        "ExtractedField", back_populates="job", cascade="all, delete-orphan"
    )
    result: Mapped["Result | None"] = relationship(
        "Result", back_populates="job", uselist=False
    )
        
    