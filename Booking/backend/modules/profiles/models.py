from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class Service(BaseModel):
    """Service model for business offerings."""
    id: str
    title: str
    description: str
    price: float
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    is_active: bool = True


class ServiceCreate(BaseModel):
    """Service creation model - id is auto-generated."""
    title: str
    description: str
    price: float
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    is_active: bool = True


class ServiceUpdate(BaseModel):
    """Service update model - all fields optional for partial updates."""
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class BusinessProfile(BaseModel):
    """Business profile model with embedded services."""
    id: str
    name: str
    description: str
    image_url: Optional[str] = None
    slug: Optional[str] = None  # Unique human-readable identifier for URLs
    owner_id: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_verified: bool = False
    is_active: bool = True
    services: List[Service] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
