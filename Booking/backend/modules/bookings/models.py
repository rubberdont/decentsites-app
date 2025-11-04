from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class BookingStatus(str, Enum):
    """Booking status enum."""
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class BookingCreate(BaseModel):
    """Booking creation request model."""
    profile_id: str
    service_id: Optional[str] = None
    booking_date: datetime
    notes: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    """Booking status update model."""
    status: BookingStatus = Field(..., description="New status for booking")


class BookingResponse(BaseModel):
    """Booking response model."""
    id: str
    booking_ref: str
    user_id: str
    profile_id: str
    service_id: Optional[str] = None
    booking_date: datetime
    status: BookingStatus
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class BookingDetailResponse(BaseModel):
    """Booking detail response with enriched profile/service info."""
    id: str
    booking_ref: str
    user_id: str
    profile_id: str
    profile_name: str
    service_id: Optional[str] = None
    service_title: Optional[str] = None
    service_price: Optional[float] = None
    booking_date: datetime
    status: BookingStatus
    notes: Optional[str] = None
    created_at: datetime


class BookingRefResponse(BaseModel):
    """Response after successful booking creation."""
    booking_ref: str
    booking_id: str
