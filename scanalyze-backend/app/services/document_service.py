"""
app/services/document_service.py – Upload logic : validation + MinIO storage + DB save
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
import boto3 # = the sender that uploads files to MinIO
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.config import get_settings
from app.models.document import Document
from app.models.user import User

settings = get_settings()
logger = logging.getLogger(__name__)

#______constants __________
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpeg", ".jpg", ".tiff"}
MAX_FILE_SIZE = 5 * 1024 * 1024 #5MB en bytes
MAGIC_BYTES = {
    ".pdf": [b"%PDF"],
    ".png": [b"\x89PNG"],
    ".jpeg": [b"\xff\xd8\xff"],
    ".jpg": [b"\xff\xd8\xff"],
    ".tiff": [b"II*\x00", b"MM\x00*"],
}
class DocumentError(Exception):
    """Domain-level document error — converted to HTTP response in the router."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

#________ MinIO client ____________
def get_s3_client():
    """create a boto3 client connected to MinIO"""
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        region_name=settings.S3_REGION,
    )
#_________ Validation _______________
def validate_file(file: UploadFile, content: bytes) -> str:
    """ 
    Validate the uploaded file:
    1 Allowed extension
    2 Non-empty file
    3 Actual file content matches the extension (magic bytes)
    4 Maximum size limit
    return the extension if valid, otherwise raise a DocumentError  
    """
    original_name = file.filename or ""
    ext = "." + original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""

    if ext not in ALLOWED_EXTENSIONS:
        raise DocumentError(
            f"Unauthorized extension. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    if len(content) == 0:
        raise DocumentError("File is empty")
    
    file_header = content[:8]
    valid_signatures = MAGIC_BYTES.get(ext, [])
    is_valid_content = any(
        file_header.startswith(signature)
        for signature in valid_signatures
    )
    
    if not is_valid_content:
        raise DocumentError(
            f"The file content does not match the '{ext}' extension. "
            f"The file appears to be corrupted or incorrectly renamed."
        )
        
    if len(content) > MAX_FILE_SIZE:
        raise DocumentError("File too large. Maximum size: 5 MB")

    return ext

class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def upload_document(
        self,
        file: UploadFile,
        current_user: User,
    ) -> Document:
        """ 
        1 Read the file
        2 Validate the extension and size
        3 Upload it to MinIO
        4 Save the metadata in the database
        5 Return the created Document
        """
        #______1 read file content ______________
        content = await file.read()
        
        #_________2 validate ________________
        ext = validate_file(file, content)
        
        #__________3 Generate a unique MinIO filename _________
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{uuid.uuid4().hex}_{timestamp}{ext}"
        
        date_folder = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        minio_path = f"uploads/{date_folder}/{unique_filename}"
        
        #________4 Upload to MinIO ____________
        try:
            s3 = get_s3_client()
            s3.put_object(
                Bucket=settings.S3_BUCKET_UPLOADS, #name of MinIO bucket
                Key=minio_path,
                Body=content,
                ContentType=file.content_type or "application/octet-stream",
            )
        except (BotoCoreError, ClientError) as e:
            raise DocumentError(
                f"Error during storage upload: {str(e)}",
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        #________ 5 Save in DataBase __________
        document = Document(
            user_id=current_user.id,
            filename=unique_filename,
            original_filename=file.filename or unique_filename,
            file_type=ext.lstrip("."),
            file_size=len(content),
            minio_path=minio_path,
        )

        self.db.add(document)
        await self.db.commit()
        await self.db.refresh(document)

        logger.info("Document uploaded successfully by user: %s", current_user.email)

        return document
         
