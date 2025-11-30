from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class OwnerCreate(BaseModel):
    """Create new owner request model."""
    username: str = Field(..., min_length=3, max_length=50)
    name: str = Field(..., min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=100)  # If None, use default


class OwnerUpdate(BaseModel):
    """Update owner request model."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None


class OwnerResponse(BaseModel):
    """Owner response model."""
    id: str
    username: str
    name: str
    email: Optional[str] = None
    role: str = "OWNER"
    is_active: bool = True
    is_deleted: bool = False
    must_change_password: bool = False
    profile_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None


class OwnerListResponse(BaseModel):
    """Paginated owner list response."""
    items: List[OwnerResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class ResetOwnerPasswordRequest(BaseModel):
    """Reset owner password to default."""
    pass  # No body needed, just resets to default


class DefaultProfileCreate(BaseModel):
    """Default profile to create for new owner."""
    name: str
    description: str = "Default business profile"
