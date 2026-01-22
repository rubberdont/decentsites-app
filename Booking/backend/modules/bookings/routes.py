from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime

from .models import (
    BookingCreate,
    BookingResponse,
    BookingRefResponse,
    BookingStatus,
    BookingStatusUpdate,
)
from .repository import BookingRepository
from modules.auth.security import get_current_user
from modules.auth.models import UserCredentials
from modules.profiles.repository import ProfileRepository
from modules.availability.repository import AvailabilityRepository
from core.mongo_helper import mongo_db
from modules.notifications.email_service import EmailService
from fastapi import BackgroundTasks


router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingRefResponse)
async def create_booking(
    booking_data: BookingCreate,
    background_tasks: BackgroundTasks,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Create a new booking.
    
    Args:
        booking_data: Booking details
        current_user: Authenticated user
        
    Returns:
        BookingRefResponse with reference and ID
        
    Raises:
        HTTPException: If profile/service not found or slot unavailable
    """
    # Verify profile exists
    profile = ProfileRepository.get_profile(booking_data.profile_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Verify service exists if service_id provided
    if booking_data.service_id:
        services = profile.get("services", [])
        service_exists = any(s["id"] == booking_data.service_id for s in services)
        if not service_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Service not found in profile"
            )
    
    # Validate booking is not for a past date
    now = datetime.utcnow()
    booking_date_only = booking_data.booking_date.date()
    today = now.date()
    
    # Reject bookings for dates before today
    if booking_date_only < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book for a past date"
        )
    
    # For today's bookings with a time slot, validate the slot hasn't passed
    if booking_data.time_slot and booking_date_only == today:
        # Parse start time from time_slot (e.g., "09:00-10:00" -> "09:00")
        try:
            start_time_str = booking_data.time_slot.split('-')[0].strip()
            slot_hour, slot_minute = map(int, start_time_str.split(':'))
        except (ValueError, IndexError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid time slot format"
            )
        
        # Create datetime for the slot start time today (using UTC for consistency)
        slot_datetime = datetime.combine(today, datetime.min.time().replace(hour=slot_hour, minute=slot_minute))
        
        # Check if this time has already passed (with 5 min buffer for edge cases)
        if now > slot_datetime:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This time slot has already passed"
            )
    
    # NEW: Handle time slot if provided
    slot_id = None
    if booking_data.time_slot:
        # Find the slot
        date_normalized = booking_data.booking_date.replace(hour=0, minute=0, second=0, microsecond=0)
        slot_doc = mongo_db.find_one(
            "availability_slots",
            {
                "profile_id": booking_data.profile_id,
                "date": date_normalized,
                "time_slot": booking_data.time_slot
            }
        )
        
        if not slot_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Time slot {booking_data.time_slot} not found"
            )
        
        slot_id = slot_doc["id"]
        
        # Check availability (capacity)
        if slot_doc["booked_count"] >= slot_doc["max_capacity"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Time slot {booking_data.time_slot} is fully booked"
            )
        
        # Increment booked count
        AvailabilityRepository.increment_booked_count(slot_id)
    
    # Create booking
    booking_doc = BookingRepository.create_booking(
        user_id=current_user.user_id,
        profile_id=booking_data.profile_id,
        booking_date=booking_data.booking_date,
        service_id=booking_data.service_id,
        time_slot=booking_data.time_slot,  # NEW
        notes=booking_data.notes
    )

    # Check if customer has auto-accept enabled
    user_doc = mongo_db.find_one("users", {"id": current_user.user_id})
    if user_doc and user_doc.get("auto_accept", False):
        # Auto-approve the booking
        BookingRepository.update_booking_status(booking_doc["id"], BookingStatus.CONFIRMED)
        
        # Add system note about auto-approval
        from modules.admin.repository import AdminRepository
        AdminRepository.add_booking_note(
            booking_doc["id"],
            "Auto-approved (customer has auto-accept enabled)",
            current_user.user_id
        )
        
        # Update booking_doc status for response
        booking_doc["status"] = BookingStatus.CONFIRMED.value

    # Notify owner about the new booking
    owner_user = mongo_db.find_one("users", {"id": profile.get("owner_id")})
    if owner_user and owner_user.get("email"):
        # Determine if booking was auto-accepted for the notification subject/context
        is_auto_accepted = user_doc.get("auto_accept", False) if user_doc else False
        
        background_tasks.add_task(
            EmailService.send_owner_new_booking,
            owner_email=owner_user["email"],
            booking_ref=booking_doc["booking_ref"],
            customer_name=current_user.name,
            profile_name=profile.get("name", "Unknown")
        )

    return BookingRefResponse(
        booking_ref=booking_doc["booking_ref"],
        booking_id=booking_doc["id"]
    )


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Get booking details (user can only see their own bookings).
    
    Args:
        booking_id: Booking ID
        current_user: Authenticated user
        
    Returns:
        BookingResponse
        
    Raises:
        HTTPException: If booking not found or user doesn't have access
    """
    booking = BookingRepository.get_booking_by_id(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Users can only view their own bookings
    if booking["user_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    return BookingResponse(**booking)


@router.get("/ref/{booking_ref}", response_model=BookingResponse)
async def get_booking_by_ref(booking_ref: str):
    """
    Get booking by reference number (public endpoint).
    
    Args:
        booking_ref: Booking reference number
        
    Returns:
        BookingResponse
        
    Raises:
        HTTPException: If booking not found
    """
    booking = BookingRepository.get_booking_by_ref(booking_ref)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    return BookingResponse(**booking)


@router.get("", response_model=List[BookingResponse])
async def list_user_bookings(current_user: UserCredentials = Depends(get_current_user)):
    """
    List all bookings for current user.
    
    Args:
        current_user: Authenticated user
        
    Returns:
        List of BookingResponse
    """
    bookings = BookingRepository.get_user_bookings(current_user.user_id)
    return [BookingResponse(**b) for b in bookings]


@router.put("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    status_update: BookingStatusUpdate,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Update booking status (CONFIRMED, REJECTED).
    Only profile owner can use this endpoint.
    
    Args:
        booking_id: Booking ID
        status_update: New status
        current_user: Authenticated user (must be profile owner)
        
    Returns:
        Updated BookingResponse
        
    Raises:
        HTTPException: If booking not found, user not owner, or invalid status
    """
    booking = BookingRepository.get_booking_by_id(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Verify user owns the profile
    profile = ProfileRepository.get_profile(booking["profile_id"])
    if not profile or profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can update booking status"
        )
    
    # Only allow CONFIRMED or REJECTED for owner
    if status_update.status not in [BookingStatus.CONFIRMED, BookingStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Owner can only set status to CONFIRMED or REJECTED"
        )
    
    # Only update if currently PENDING
    if booking["status"] != BookingStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update PENDING bookings"
        )
    
    BookingRepository.update_booking_status(booking_id, status_update.status)
    
    updated_booking = BookingRepository.get_booking_by_id(booking_id)
    return BookingResponse(**updated_booking)


@router.put("/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Cancel a booking (user can cancel own bookings, owner can cancel any on their profile).
    
    Args:
        booking_id: Booking ID
        current_user: Authenticated user
        
    Returns:
        Updated BookingResponse
        
    Raises:
        HTTPException: If booking not found or user not authorized
    """
    booking = BookingRepository.get_booking_by_id(booking_id)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check authorization: user owns booking OR user owns profile
    is_user = booking["user_id"] == current_user.user_id
    profile = ProfileRepository.get_profile(booking["profile_id"])
    is_owner = profile and profile.get("owner_id") == current_user.user_id
    
    if not (is_user or is_owner):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this booking"
        )
    
    # Don't allow cancelling already rejected or cancelled bookings
    if booking["status"] in [BookingStatus.REJECTED.value, BookingStatus.CANCELLED.value]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel booking with status {booking['status']}"
        )
    
    # NEW: Decrement time slot booked count if there's a time slot
    if booking.get("time_slot"):
        date_normalized = booking["booking_date"].replace(hour=0, minute=0, second=0, microsecond=0)
        slot_doc = mongo_db.find_one(
            "availability_slots",
            {
                "profile_id": booking["profile_id"],
                "date": date_normalized,
                "time_slot": booking["time_slot"]
            }
        )
        
        if slot_doc:
            AvailabilityRepository.decrement_booked_count(slot_doc["id"])
    
    BookingRepository.cancel_booking(booking_id)
    
    updated_booking = BookingRepository.get_booking_by_id(booking_id)
    return BookingResponse(**updated_booking)


@router.get("/profile/{profile_id}/bookings", response_model=List[BookingResponse])
async def get_profile_bookings(
    profile_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Get all bookings for a profile (only owner can view).
    
    Args:
        profile_id: Profile ID
        current_user: Authenticated user (must be profile owner)
        
    Returns:
        List of BookingResponse
        
    Raises:
        HTTPException: If profile not found or user not owner
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Only owner can view bookings for their profile
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can view bookings"
        )
    
    bookings = BookingRepository.get_profile_bookings(profile_id)
    return [BookingResponse(**b) for b in bookings]
