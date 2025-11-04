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


router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingRefResponse)
async def create_booking(
    booking_data: BookingCreate,
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
        HTTPException: If profile/service not found
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
    
    # Validate booking date is in future
    if booking_data.booking_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking date must be in the future"
        )
    
    # Create booking
    booking_doc = BookingRepository.create_booking(
        user_id=current_user.user_id,
        profile_id=booking_data.profile_id,
        booking_date=booking_data.booking_date,
        service_id=booking_data.service_id,
        notes=booking_data.notes
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
