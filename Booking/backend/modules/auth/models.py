from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration."""
    USER = "USER"
    OWNER = "OWNER"
    ADMIN = "ADMIN"


class UserRegister(BaseModel):
    """User registration request model."""
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    email: Optional[str] = None


class UserLogin(BaseModel):
    """User login request model."""
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class UserProfile(BaseModel):
    """User profile update model."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class ForgotPasswordRequest(BaseModel):
    """Forgot password request model."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request model."""
    token: str
    new_password: str = Field(..., min_length=6, max_length=100)


class ChangePasswordRequest(BaseModel):
    """Change password request model."""
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6, max_length=100)


class UserResponse(BaseModel):
    """User response model (without password hash)."""
    id: str
    username: str
    name: str
    email: Optional[str] = None
    role: UserRole = UserRole.USER
    created_at: datetime


class TokenResponse(BaseModel):
    """JWT token response model."""
    access_token: str
    token_type: str = "bearer"


class UserCredentials(BaseModel):
    """Internal model for verified user credentials."""
    user_id: str
    username: str
    name: str
    role: UserRole = UserRole.USER
