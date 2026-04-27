"""
app/core/exceptions.py – Global exception handlers
"""
import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError):
        # Flatten pydantic errors into a readable list
        errors = []
        for err in exc.errors():
            field = " → ".join(str(loc) for loc in err["loc"] if loc != "body")
            errors.append({"field": field, "message": err["msg"]})
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": "Validation error", "errors": errors},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.error("DB integrity error: %s", exc)
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": "Resource already exists"},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception on %s %s", request.method, request.url)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error"},
        )