from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class Service(BaseModel):
    """Service model for business offerings."""
    id: str
    title: str
    description: str
    price: float
    image_url: Optional[str] = None


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
