"""
app/services/admin_service.py – Admin business logic
"""
import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.services.email import (
    send_account_approved_email,
    send_account_rejected_email,
)

logger = logging.getLogger(__name__)

class AdminError(Exception):
    """Domain-level admin error — converted to HTTP response in the router."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)
        
class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
    #_________ List pending users __________
    async def get_pending_users(self) -> list[User]:
        """Return all users waiting for admin approval"""
        result = await self.db.execute(
            select(User).where(User.account_enabled == False)
        )
        return result.scalars().all()
    
    #__________ Enable user ______________
    async def enable_user(self, user_id: uuid.UUID) -> User:
        """Approuve a user account and notify them by eamil"""
        
        #find the user in DB
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()
        
        # Check if user exists
        if user is None:
            raise AdminError("User not found", 404)
        # Check if already enabled
        if user.account_enabled:
            raise AdminError("Account is already enabled", 400)
        # Approve the account 
        user.account_enabled = True
        await self.db.flush()
        
        # Notify the user by email
        await send_account_approved_email(
            user_email=user.email,
            user_full_name=user.full_name,
        )

        logger.info("Account approved: %s", user.email)
        return user
    #______ disable user __________________
    async def disable_user(self, user_id: uuid.UUID) -> User:
        """Disable a user account and notify them by email"""
      
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        if user is None:
            raise AdminError("User not found", 404)

        # Check if already disabled
        if not user.account_enabled:
            raise AdminError("Account is already disabled", 400)
        
        # Disable the account
        user.account_enabled = False
        await self.db.flush()

        await send_account_rejected_email(
            user_email=user.email,
            user_full_name=user.full_name,
        )

        logger.info("Account disabled: %s", user.email)
        return user
    