from pydantic import BaseModel
from typing import List, Optional


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
    owner_id: Optional[str] = None
    services: List[Service] = []
