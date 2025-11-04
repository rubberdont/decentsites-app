from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    """User registration request model."""
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """User login request model."""
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    """User response model (without password hash)."""
    id: str
    username: str
    name: str
    email: Optional[str] = None
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
