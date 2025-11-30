from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Extended BookingStatus enum
class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"


# Booking filter model
class BookingFilters(BaseModel):
    status: Optional[str] = None
    search: Optional[str] = None  # customer name, email, or booking ref
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    service_id: Optional[str] = None
    profile_id: Optional[str] = None


# Admin booking response with customer info
class AdminBookingResponse(BaseModel):
    id: str
    booking_ref: str
    user_id: str
    user_name: str
    user_email: Optional[str] = None
    user_phone: Optional[str] = None
    profile_id: str
    profile_name: str
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    service_price: Optional[float] = None
    booking_date: datetime
    time_slot: Optional[str] = None
    status: str
    notes: Optional[str] = None
    admin_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# Paginated response
class PaginatedResponse(BaseModel):
    items: List[AdminBookingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# Booking action models
class BookingApproveRequest(BaseModel):
    notes: Optional[str] = None


class BookingRejectRequest(BaseModel):
    reason: Optional[str] = None


class BookingRescheduleRequest(BaseModel):
    new_date: datetime
    new_time_slot: Optional[str] = None
    notes: Optional[str] = None


class BookingNoteRequest(BaseModel):
    note: str


# Customer models
class CustomerResponse(BaseModel):
    id: str
    username: str
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    total_bookings: int = 0
    completed_bookings: int = 0
    cancelled_bookings: int = 0
    no_shows: int = 0
    total_spent: float = 0.0
    first_booking: Optional[datetime] = None
    last_booking: Optional[datetime] = None
    is_blocked: bool = False
    blocked_reason: Optional[str] = None
    created_at: datetime


class CustomerFilters(BaseModel):
    search: Optional[str] = None
    is_blocked: Optional[bool] = None
    min_bookings: Optional[int] = None


class CustomerBlockRequest(BaseModel):
    reason: Optional[str] = None


class CustomerNoteCreate(BaseModel):
    note: str


class CustomerNote(BaseModel):
    id: str
    customer_id: str
    note: str
    created_by: str
    created_by_name: str
    created_at: datetime


# Dashboard / Analytics models
class DashboardStats(BaseModel):
    total_bookings: int = 0
    pending_bookings: int = 0
    confirmed_bookings: int = 0
    today_bookings: int = 0
    this_week_bookings: int = 0
    this_month_bookings: int = 0
    total_revenue: float = 0.0
    this_week_revenue: float = 0.0
    this_month_revenue: float = 0.0
    total_customers: int = 0
    new_customers_this_week: int = 0
    completion_rate: float = 0.0
    no_show_rate: float = 0.0


class BookingTrend(BaseModel):
    date: str  # YYYY-MM-DD
    count: int
    revenue: float = 0.0


class ServiceStats(BaseModel):
    service_id: str
    service_title: str
    booking_count: int
    revenue: float = 0.0
    percentage: float = 0.0


class PeakHour(BaseModel):
    hour: int  # 0-23
    count: int


class AnalyticsResponse(BaseModel):
    dashboard: DashboardStats
    booking_trends: List[BookingTrend] = []
    popular_services: List[ServiceStats] = []
    peak_hours: List[PeakHour] = []


# Activity log
class ActivityLog(BaseModel):
    id: str
    user_id: str
    user_name: str
    action: str  # booking_created, booking_confirmed, etc.
    entity_type: str  # booking, customer, service
    entity_id: str
    details: Optional[dict] = None
    created_at: datetime
