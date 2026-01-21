"""
Admin Routes - Comprehensive FastAPI router for admin operations.

Provides endpoints for:
- Booking management (list, view, approve, reject, cancel, complete, no-show, reschedule, notes)
- Customer management (list, view, bookings, block, unblock, notes)
- Analytics (dashboard, trends, services, peak hours)
- Activity logging
"""

from fastapi import APIRouter, Depends, HTTPException, status as http_status, Query
from typing import Optional, List
from datetime import datetime
import math

from modules.auth.security import require_owner
from modules.auth.models import UserCredentials, UserRole
from modules.profiles.repository import ProfileRepository
from core.mongo_helper import mongo_db

from .models import (
    BookingStatus,
    BookingFilters,
    AdminBookingResponse,
    PaginatedResponse,
    BookingApproveRequest,
    BookingRejectRequest,
    BookingRescheduleRequest,
    BookingNoteRequest,
    CustomerResponse,
    CustomerFilters,
    CustomerBlockRequest,
    CustomerNoteCreate,
    CustomerNote,
    DashboardStats,
    BookingTrend,
    ServiceStats,
    PeakHour,
    PeakHoursResponse,
    AnalyticsResponse,
    AnalyticsOverviewResponse,
    ActivityLog
)
from .repository import AdminRepository


router = APIRouter(prefix="/admin", tags=["Admin"])


# ===========================
# HELPER FUNCTIONS
# ===========================

def get_owner_profile_id(user_id: str) -> str:
    """
    Get the profile ID owned by the user.
    
    Args:
        user_id: The owner's user ID
        
    Returns:
        Profile ID
        
    Raises:
        HTTPException: If no profile found for user
    """
    db = mongo_db.get_database()
    profile = db.profiles.find_one({"owner_id": user_id})
    
    if not profile:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="No profile found for this owner"
        )
    
    return profile["id"]


def verify_booking_ownership(booking_id: str, profile_id: str) -> dict:
    """
    Verify that a booking belongs to the owner's profile.
    
    Args:
        booking_id: The booking ID
        profile_id: The owner's profile ID
        
    Returns:
        Booking document
        
    Raises:
        HTTPException: If booking not found or doesn't belong to profile
    """
    booking = AdminRepository.get_booking_with_details(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    if booking.get("profile_id") != profile_id:
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this booking"
        )
    
    return booking


def verify_owner_can_access_booking(booking_id: str, profile_id: str, owner_user_id: str) -> dict:
    """
    Verify that an owner can access a booking.
    
    Owner can access if:
    - Booking is for their profile, OR
    - Booking's customer belongs to them (customer.owner_id == owner_user_id)
    
    Args:
        booking_id: The booking ID
        profile_id: The owner's profile ID
        owner_user_id: The owner's user ID
        
    Returns:
        Booking document
        
    Raises:
        HTTPException: If booking not found or owner cannot access it
    """
    booking = AdminRepository.get_booking_with_details(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if booking is for owner's profile
    if booking.get("profile_id") == profile_id:
        return booking
    
    # Check if booking's customer belongs to owner
    db = mongo_db.get_database()
    customer = db.users.find_one({"id": booking.get("user_id")})
    
    if customer and customer.get("owner_id") == owner_user_id:
        return booking
    
    # Owner cannot access this booking
    raise HTTPException(
        status_code=http_status.HTTP_403_FORBIDDEN,
        detail="You don't have access to this booking"
    )


def verify_customer_has_bookings(customer_id: str, profile_id: str) -> bool:
    """
    Verify that a customer has bookings with the owner's profile.
    
    Args:
        customer_id: The customer's user ID
        profile_id: The owner's profile ID
        
    Returns:
        True if customer has bookings
        
    Raises:
        HTTPException: If customer has no bookings with this profile
    """
    db = mongo_db.get_database()
    booking = db.bookings.find_one({"user_id": customer_id, "profile_id": profile_id})
    
    if not booking:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Customer not found or has no bookings with your profile"
        )
    
    return True


# ===========================
# BOOKINGS ENDPOINTS
# ===========================

@router.get("/bookings", response_model=PaginatedResponse)
async def list_bookings(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status: Optional[str] = Query(None, description="Filter by booking status"),
    search: Optional[str] = Query(None, description="Search by customer name, email, or booking ref"),
    start_date: Optional[datetime] = Query(None, description="Filter bookings from this date"),
    end_date: Optional[datetime] = Query(None, description="Filter bookings until this date"),
    sort_by: str = Query("created_at", description="Sort by field"),
    sort_order: str = Query("desc", description="Sort order (asc or desc)"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    List all bookings with filters and pagination.
    
    - ADMIN/SUPERADMIN: Can see ALL bookings across all profiles
    - OWNER: Can only see bookings from their own profile
    
    Supports filtering by status, date range, and search.
    Search matches customer name, email, username, or booking reference.
    """
    # Validate status if provided
    if status and status not in [s.value for s in BookingStatus]:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {[s.value for s in BookingStatus]}"
        )
    
    # Prepare filters (without profile_id initially)
    filters = {
        "status": status,
        "search": search,
        "start_date": start_date,
        "end_date": end_date
    }
    
    # Role-based filtering:
    # - ADMIN/SUPERADMIN: See all bookings (no filter)
    # - OWNER: See bookings from their profile OR from their customers
    if current_user.role in [UserRole.ADMIN, UserRole.SUPERADMIN]:
        # Don't add any filter - admins see all bookings
        pass
    else:
        # OWNER role - filter by profile ownership OR customer ownership
        profile_id = get_owner_profile_id(current_user.user_id)
        filters["owner_scope"] = {
            "profile_id": profile_id,
            "owner_user_id": current_user.user_id
        }
    
    # Determine sort order
    sort_order_val = -1 if sort_order.lower() == "desc" else 1
    
    # Get paginated bookings
    bookings, total = AdminRepository.get_bookings_paginated(
        filters=filters,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order_val
    )
    
    # Calculate total pages
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    # Convert to response models
    booking_responses = [
        AdminBookingResponse(
            id=b.get("id", ""),
            booking_ref=b.get("booking_ref", ""),
            user_id=b.get("user_id", ""),
            user_name=b.get("customer_name", "Unknown"),
            user_email=b.get("customer_email"),
            user_phone=b.get("customer_phone"),
            profile_id=b.get("profile_id", ""),
            profile_name=b.get("profile_name", "Unknown"),
            service_id=b.get("service_id"),
            service_name=b.get("service_title"),
            service_price=b.get("service_price"),
            booking_date=b.get("booking_date", datetime.utcnow()),
            time_slot=b.get("time_slot"),
            status=b.get("status", "PENDING"),
            notes=b.get("notes"),
            admin_notes=b.get("admin_notes"),
            created_at=b.get("created_at", datetime.utcnow()),
            updated_at=b.get("updated_at", datetime.utcnow())
        )
        for b in bookings
    ]
    
    return PaginatedResponse(
        items=booking_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/bookings/{booking_id}")
async def get_booking(
    booking_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get single booking with full details.
    
    Includes customer information, service details, and admin notes.
    """
    # Admins can view any booking
    if current_user.role in [UserRole.ADMIN, UserRole.SUPERADMIN]:
        booking = AdminRepository.get_booking_with_details(booking_id)
        if not booking:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Booking not found"
            )
    else:
        # Owners can view bookings from their profile OR their customers
        profile_id = get_owner_profile_id(current_user.user_id)
        booking = verify_owner_can_access_booking(booking_id, profile_id, current_user.user_id)
    
    # Get booking notes (common for both cases)
    notes = AdminRepository.get_booking_notes(booking_id)
    booking["admin_notes_list"] = notes
    
    return booking


@router.put("/bookings/{booking_id}/approve")
async def approve_booking(
    booking_id: str,
    data: BookingApproveRequest,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Approve a pending booking.
    
    Changes status from PENDING to CONFIRMED.
    Optionally adds admin notes.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    booking = verify_booking_ownership(booking_id, profile_id)
    
    # Validate current status
    if booking.get("status") != BookingStatus.PENDING.value:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be approved"
        )
    
    # Update status
    AdminRepository.update_booking_status(booking_id, BookingStatus.CONFIRMED.value)
    
    # Add note if provided
    if data.notes:
        AdminRepository.add_booking_note(booking_id, data.notes, current_user.user_id)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="booking_approved",
        entity_type="booking",
        entity_id=booking_id,
        details={
            "customer_name": booking.get("customer_name"),
            "booking_date": str(booking.get("booking_date"))
        },
        profile_id=profile_id
    )
    
    return {"message": "Booking approved successfully", "status": BookingStatus.CONFIRMED.value}


@router.put("/bookings/{booking_id}/reject")
async def reject_booking(
    booking_id: str,
    data: BookingRejectRequest,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Reject a pending booking.
    
    Changes status from PENDING to REJECTED.
    Optionally records rejection reason.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    booking = verify_booking_ownership(booking_id, profile_id)
    
    # Validate current status
    if booking.get("status") != BookingStatus.PENDING.value:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only pending bookings can be rejected"
        )
    
    # Update status
    AdminRepository.update_booking_status(booking_id, BookingStatus.REJECTED.value)
    
    # Add rejection reason as note if provided
    if data.reason:
        AdminRepository.add_booking_note(
            booking_id, 
            f"Rejection reason: {data.reason}", 
            current_user.user_id
        )
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="booking_rejected",
        entity_type="booking",
        entity_id=booking_id,
        details={
            "customer_name": booking.get("customer_name"),
            "reason": data.reason
        },
        profile_id=profile_id
    )
    
    return {"message": "Booking rejected", "status": BookingStatus.REJECTED.value}


@router.put("/bookings/{booking_id}/cancel")
async def cancel_booking(
    booking_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Cancel a booking.
    
    Changes status to CANCELLED.
    Works for PENDING or CONFIRMED bookings.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    booking = verify_booking_ownership(booking_id, profile_id)
    
    # Validate current status
    allowed_statuses = [BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value]
    if booking.get("status") not in allowed_statuses:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only pending or confirmed bookings can be cancelled"
        )
    
    # Update status
    AdminRepository.update_booking_status(booking_id, BookingStatus.CANCELLED.value)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="booking_cancelled",
        entity_type="booking",
        entity_id=booking_id,
        details={
            "customer_name": booking.get("customer_name"),
            "previous_status": booking.get("status")
        },
        profile_id=profile_id
    )
    
    return {"message": "Booking cancelled", "status": BookingStatus.CANCELLED.value}


@router.put("/bookings/{booking_id}/complete")
async def complete_booking(
    booking_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Mark booking as completed.
    
    Changes status from CONFIRMED to COMPLETED.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    booking = verify_booking_ownership(booking_id, profile_id)
    
    # Validate current status
    if booking.get("status") != BookingStatus.CONFIRMED.value:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed bookings can be marked as completed"
        )
    
    # Update status
    AdminRepository.update_booking_status(booking_id, BookingStatus.COMPLETED.value)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="booking_completed",
        entity_type="booking",
        entity_id=booking_id,
        details={
            "customer_name": booking.get("customer_name"),
            "service_title": booking.get("service_title")
        },
        profile_id=profile_id
    )
    
    return {"message": "Booking marked as completed", "status": BookingStatus.COMPLETED.value}


@router.put("/bookings/{booking_id}/no-show")
async def mark_no_show(
    booking_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Mark booking as no-show.
    
    Changes status from CONFIRMED to NO_SHOW.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    booking = verify_booking_ownership(booking_id, profile_id)
    
    # Validate current status
    if booking.get("status") != BookingStatus.CONFIRMED.value:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only confirmed bookings can be marked as no-show"
        )
    
    # Update status
    AdminRepository.update_booking_status(booking_id, BookingStatus.NO_SHOW.value)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="booking_no_show",
        entity_type="booking",
        entity_id=booking_id,
        details={
            "customer_name": booking.get("customer_name"),
            "customer_id": booking.get("user_id")
        },
        profile_id=profile_id
    )
    
    return {"message": "Booking marked as no-show", "status": BookingStatus.NO_SHOW.value}


@router.put("/bookings/{booking_id}/reschedule")
async def reschedule_booking(
    booking_id: str,
    data: BookingRescheduleRequest,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Reschedule a booking to a new date/time.
    
    Works for PENDING or CONFIRMED bookings.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    booking = verify_booking_ownership(booking_id, profile_id)
    
    # Validate current status
    allowed_statuses = [BookingStatus.PENDING.value, BookingStatus.CONFIRMED.value]
    if booking.get("status") not in allowed_statuses:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Only pending or confirmed bookings can be rescheduled"
        )
    
    # Validate new date is in the future
    if data.new_date < datetime.utcnow():
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="New booking date must be in the future"
        )
    
    # Store old date for logging
    old_date = booking.get("booking_date")
    old_time_slot = booking.get("time_slot")
    
    # Update booking
    AdminRepository.reschedule_booking(booking_id, data.new_date, data.new_time_slot)
    
    # Add note if provided
    if data.notes:
        AdminRepository.add_booking_note(booking_id, f"Rescheduled: {data.notes}", current_user.user_id)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="booking_rescheduled",
        entity_type="booking",
        entity_id=booking_id,
        details={
            "customer_name": booking.get("customer_name"),
            "old_date": str(old_date),
            "old_time_slot": old_time_slot,
            "new_date": str(data.new_date),
            "new_time_slot": data.new_time_slot
        },
        profile_id=profile_id
    )
    
    return {
        "message": "Booking rescheduled successfully",
        "new_date": data.new_date,
        "new_time_slot": data.new_time_slot
    }


@router.post("/bookings/{booking_id}/notes")
async def add_booking_note(
    booking_id: str,
    data: BookingNoteRequest,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Add admin note to booking.
    
    Notes are internal and not visible to customers.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_booking_ownership(booking_id, profile_id)
    
    # Add note
    note_id = AdminRepository.add_booking_note(booking_id, data.note, current_user.user_id)
    
    return {"message": "Note added successfully", "note_id": note_id}


# ===========================
# CUSTOMERS ENDPOINTS
# ===========================

@router.get("/customers")
async def list_customers(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name, email, or username"),
    is_blocked: Optional[bool] = Query(None, description="Filter by blocked status"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    List all customers with stats.
    
    Shows customers who have booked with this profile.
    Includes booking statistics and blocked status.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    # Prepare filters
    filters = {
        "search": search,
        "is_blocked": is_blocked
    }
    
    # Get paginated customers
    customers, total = AdminRepository.get_customers_paginated(
        filters=filters,
        page=page,
        page_size=page_size,
        profile_id=profile_id
    )
    
    # Calculate total pages
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return {
        "items": customers,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/customers/{customer_id}")
async def get_customer(
    customer_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get customer details with stats.
    
    Includes booking statistics, spending, and blocked status.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_customer_has_bookings(customer_id, profile_id)
    
    customer = AdminRepository.get_customer_with_stats(customer_id, profile_id)
    
    if not customer:
        raise HTTPException(
            status_code=http_status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return customer


@router.get("/customers/{customer_id}/bookings")
async def get_customer_bookings(
    customer_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get customer booking history.
    
    Lists all bookings made by this customer.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_customer_has_bookings(customer_id, profile_id)
    
    bookings, total = AdminRepository.get_customer_bookings(
        user_id=customer_id,
        page=page,
        page_size=page_size,
        profile_id=profile_id
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return {
        "items": bookings,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.put("/customers/{customer_id}/block")
async def block_customer(
    customer_id: str,
    data: CustomerBlockRequest,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Block a customer from making new bookings.
    
    Blocked customers cannot create new bookings.
    Existing bookings are not affected.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_customer_has_bookings(customer_id, profile_id)
    
    # Check if already blocked
    if AdminRepository.is_customer_blocked(customer_id, profile_id):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Customer is already blocked"
        )
    
    # Block customer
    block_id = AdminRepository.block_customer(
        user_id=customer_id,
        profile_id=profile_id,
        blocked_by=current_user.user_id,
        reason=data.reason
    )
    
    # Get customer info for logging
    customer = AdminRepository.get_customer_with_stats(customer_id, profile_id)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="customer_blocked",
        entity_type="customer",
        entity_id=customer_id,
        details={
            "customer_name": customer.get("name") if customer else "Unknown",
            "reason": data.reason
        },
        profile_id=profile_id
    )
    
    return {"message": "Customer blocked successfully", "block_id": block_id}


@router.put("/customers/{customer_id}/unblock")
async def unblock_customer(
    customer_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Unblock a customer.
    
    Allows them to make new bookings again.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_customer_has_bookings(customer_id, profile_id)
    
    # Check if actually blocked
    if not AdminRepository.is_customer_blocked(customer_id, profile_id):
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="Customer is not blocked"
        )
    
    # Unblock customer
    AdminRepository.unblock_customer(customer_id, profile_id)
    
    # Get customer info for logging
    customer = AdminRepository.get_customer_with_stats(customer_id, profile_id)
    
    # Log activity
    AdminRepository.log_activity(
        user_id=current_user.user_id,
        action="customer_unblocked",
        entity_type="customer",
        entity_id=customer_id,
        details={
            "customer_name": customer.get("name") if customer else "Unknown"
        },
        profile_id=profile_id
    )
    
    return {"message": "Customer unblocked successfully"}


@router.post("/customers/{customer_id}/notes")
async def add_customer_note(
    customer_id: str,
    data: CustomerNoteCreate,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Add note to customer.
    
    Notes are internal and not visible to customers.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_customer_has_bookings(customer_id, profile_id)
    
    # Add note
    note_id = AdminRepository.add_customer_note(
        customer_id=customer_id,
        note=data.note,
        created_by=current_user.user_id,
        profile_id=profile_id
    )
    
    return {"message": "Note added successfully", "note_id": note_id}


@router.get("/customers/{customer_id}/notes")
async def get_customer_notes(
    customer_id: str,
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get customer notes.
    
    Returns all notes for this customer.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    verify_customer_has_bookings(customer_id, profile_id)
    
    notes = AdminRepository.get_customer_notes(customer_id, profile_id)
    
    return {"notes": notes}


# ===========================
# ANALYTICS ENDPOINTS
# ===========================

@router.get("/analytics/dashboard", response_model=DashboardStats)
async def get_dashboard(
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get dashboard statistics.
    
    Includes booking counts, revenue, customer counts, and rates.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    stats = AdminRepository.get_dashboard_stats(profile_id)
    
    return DashboardStats(**stats)


@router.get("/analytics/overview", response_model=AnalyticsOverviewResponse)
async def get_analytics_overview(
    start_date: datetime = Query(..., description="Start date for analytics (ISO format)"),
    end_date: datetime = Query(..., description="End date for analytics (ISO format)"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get comprehensive analytics overview for a date range.
    
    Returns:
    - Period summary
    - Total bookings and revenue
    - Average booking value
    - Completion and cancellation rates
    - Popular services
    - Booking trends
    
    This endpoint matches the frontend AnalyticsOverview interface.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    # Validate date range
    if start_date > end_date:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before end_date"
        )
    
    overview = AdminRepository.get_analytics_overview(profile_id, start_date, end_date)
    
    return AnalyticsOverviewResponse(**overview)


@router.get("/analytics/booking-trends")
async def get_booking_trends_by_range(
    start_date: datetime = Query(..., description="Start date for trends (ISO format)"),
    end_date: datetime = Query(..., description="End date for trends (ISO format)"),
    granularity: str = Query("day", regex="^(day|week|month)$", description="Granularity: day, week, or month"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get booking trends for a date range with configurable granularity.
    
    Args:
        start_date: Start of date range (ISO format)
        end_date: End of date range (ISO format)
        granularity: "day", "week", or "month"
    
    Returns list of:
    - date: Date string (format depends on granularity)
    - count: Number of bookings
    - revenue: Revenue from completed bookings
    
    This endpoint matches the frontend BookingTrend[] interface.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    # Validate date range
    if start_date > end_date:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail="start_date must be before end_date"
        )
    
    trends = AdminRepository.get_booking_trends_by_range(
        profile_id, start_date, end_date, granularity
    )
    
    return trends


@router.get("/analytics/trends")
async def get_trends(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get booking trends over time (legacy endpoint).
    
    Returns daily booking counts and revenue for the specified period.
    Use /analytics/booking-trends for date range support.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    trends = AdminRepository.get_booking_trends(profile_id, days)
    
    return {"trends": trends, "days": days}


@router.get("/analytics/services")
async def get_service_stats(
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get popular services stats.
    
    Returns booking counts and revenue by service.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    services = AdminRepository.get_popular_services(profile_id)
    
    return {"services": services}


@router.get("/analytics/peak-hours")
async def get_peak_hours(
    start_date: Optional[datetime] = Query(None, description="Start date for peak hours analysis"),
    end_date: Optional[datetime] = Query(None, description="End date for peak hours analysis"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get peak booking hours.
    
    Returns booking counts by hour of day.
    
    If start_date and end_date are provided, returns peak hours for that range
    with the frontend-compatible format (hour as string, booking_count, percentage).
    
    If no dates provided, returns legacy format for all-time data.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    # If date range provided, use new format
    if start_date is not None and end_date is not None:
        # Validate date range
        if start_date > end_date:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="start_date must be before end_date"
            )
        
        peak_hours = AdminRepository.get_peak_hours_by_range(profile_id, start_date, end_date)
        return peak_hours
    
    # Legacy format (all-time, no date filter)
    peak_hours = AdminRepository.get_peak_hours(profile_id)
    
    return {"peak_hours": peak_hours}


# ===========================
# ACTIVITY LOG ENDPOINTS
# ===========================

@router.get("/activities")
async def get_activities(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: UserCredentials = Depends(require_owner)
):
    """
    Get recent admin activities.
    
    Returns logged admin actions like approvals, rejections, blocks, etc.
    """
    profile_id = get_owner_profile_id(current_user.user_id)
    
    activities, total = AdminRepository.get_activities_paginated(
        profile_id=profile_id,
        page=page,
        page_size=page_size
    )
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return {
        "items": activities,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }
