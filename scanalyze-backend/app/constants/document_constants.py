"""
app/constants/document_constants.py – Constants for document upload
"""
import uuid
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpeg", ".jpg", ".tiff"}

MAX_FILE_SIZE = 5 * 1024 * 1024

MAGIC_BYTES = {
    ".pdf": [b"%PDF"],
    ".png": [b"\x89PNG"],
    ".jpeg": [b"\xff\xd8\xff"],
    ".jpg": [b"\xff\xd8\xff"],
    ".tiff": [b"II*\x00", b"MM\x00*"],
}
#UUID fixed for "autres" document type to ensure it always has the same ID in the system,
OTHERS_DOC_TYPE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
OTHERS_DOC_TYPE_NAME = "autres"