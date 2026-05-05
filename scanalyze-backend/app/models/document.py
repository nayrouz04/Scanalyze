"""
app/models/document.py – Document ORM model
"""

from __future__ import annotations
import uuid
from datetime import datetime
from enum import Enum
from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

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
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(10), nullable=False)   # pdf, png ...
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)    
    minio_path: Mapped[str] = mapped_column(String(500), nullable=False)  #  MinIO path
    status: Mapped[str] = mapped_column( # document status
        String(20),
        nullable=False,
        default=DocumentStatus.UPLOADED.value  
    )
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    
    #relationship 
    user: Mapped["User"] = relationship("User", back_populates="documents")
    
    def __repr__(self) -> str:
        return f"<Document id={self.id} filename={self.filename} user_id={self.user_id}>"
    