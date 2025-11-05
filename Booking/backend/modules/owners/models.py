from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ServiceStats(BaseModel):
    """Statistics for a specific service."""
    service_id: str
    service_title: str
    total_bookings: int
    revenue: float


class DateCount(BaseModel):
    """Date with booking count."""
    date: str
    count: int


class DashboardStats(BaseModel):
    """Owner dashboard statistics."""
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    today_bookings: int
    this_week_bookings: int
    total_revenue: float


class ProfileAnalytics(BaseModel):
    """Analytics for a specific business profile."""
    profile_id: str
    profile_name: str
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    popular_services: List[ServiceStats]
    booking_trend: List[DateCount]


class ProfileWithBookingCount(BaseModel):
    """Profile with associated booking count."""
    id: str
    name: str
    description: str
    image_url: Optional[str] = None
    owner_id: str
    services: List = []
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
