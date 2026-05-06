"""
app/services/admin_service.py – Admin business logic
"""
import logging
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.schemas.auth import AdminCreateUserRequest, UpdateUserRequest

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
    #________ Get all users __________
    
    async def get_all_users(self) -> list[User]:
        """Return all the users and admins"""
        result = await self.db.execute(select(User))
        return result.scalars().all()
    #_____ Create user _______________
    async def create_user(self, data: AdminCreateUserRequest) -> User:
        """Creates a user directly activated by the admin"""
        
        #check if the email already exist
        existing = await self.db.execute(
            select(User).where(User.email == data.email.lower())
        )
        if existing.scalar_one_or_none():
           raise AdminError("Email already registred", 409)
        
        #create user 
        user = User(
            id=uuid.uuid4(),
            email=data.email.lower(),
            hashed_password=hash_password(data.password),
            full_name=data.full_name.strip(),
            role="user",                  # always user
            office_address=data.office_address,
            phone_nbr=data.phone_nbr,
            birth_date=data.birth_date,
            is_active=True,
            is_verified=True,             # directly verified
            account_enabled=True,         # directly enabled
        ) 
        self.db.add(user)
        await self.db.flush()
        
        logger.info("User created by admin: %s", user.email)
        return user
    #_______ Delete user _____________
    async def delete_user(self, user_id: uuid.UUID) -> User:
        """Permanently deletes a user (not an admin)"""
        
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        #check if the user exists
        if user is None:
            raise AdminError("User not found", 404)
        
        # Check that it is not an admin
        if user.role == "admin":   
            raise AdminError("Cannot delete an admin account", 403)
        
        await self.db.delete(user)
        await self.db.flush()
        
        logger.info("User deleted by admin: %s", user.email)
        return user
    #__________ update user ____________
    async def update_user(self, user_id: uuid.UUID, data: UpdateUserRequest) -> User:
        """Updates a user's information(not an admin)"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        user = result.scalar_one_or_none()

        # Check if the user exists
        if user is None:
            raise AdminError("User not found", 404)
        # Check that it is not an admin
        if user.role == "admin":
            raise AdminError("Cannot modify an admin account", 403)
        
        # Update only provided fields (not None)
        if data.full_name is not None:
            user.full_name = data.full_name
        if data.email is not None:
            # Check that the new email is not already taken
            existing = await self.db.execute(
                select(User).where(User.email == data.email.lower())
            )
            if existing.scalar_one_or_none():
                raise AdminError("Email already registered", 409)
            user.email = data.email.lower()
        if data.office_address is not None:
            user.office_address = data.office_address
        if data.phone_nbr is not None:
            user.phone_nbr = data.phone_nbr
        if data.is_active is not None:
            user.is_active = data.is_active
        if data.account_enabled is not None:
            user.account_enabled = data.account_enabled
            
        await self.db.flush()
        
        logger.info("User updated by admin: %s", user.email)
        return user