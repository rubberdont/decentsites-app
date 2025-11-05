from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime

from modules.auth.security import get_current_user
from modules.auth.models import UserCredentials
from modules.profiles.repository import ProfileRepository
from .models import AvailabilityCreate, AvailabilitySlot, DateAvailability, SlotCapacityUpdate
from .repository import AvailabilityRepository


router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("/profiles/{profile_id}/slots", response_model=List[AvailabilitySlot])
async def create_availability_slots(
    profile_id: str,
    availability_data: AvailabilityCreate,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Create availability slots for a profile on a specific date.
    Only profile owner can create slots.
    
    Args:
        profile_id: Profile ID
        availability_data: Date and slot configuration
        current_user: Authenticated owner user
        
    Returns:
        List of created AvailabilitySlot
        
    Raises:
        HTTPException: If profile not found or user is not the owner
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can create slots"
        )
    
    created_slots = AvailabilityRepository.create_slots_for_date(
        profile_id,
        availability_data.date,
        availability_data.config
    )
    
    return [AvailabilitySlot(**s) for s in created_slots]


@router.get("/profiles/{profile_id}", response_model=List[DateAvailability])
async def get_availability_for_date_range(
    profile_id: str,
    start_date: datetime,
    end_date: datetime,
):
    """
    Get availability for a profile within a date range.
    Public endpoint.
    
    Args:
        profile_id: Profile ID
        start_date: Start date (query parameter)
        end_date: End date (query parameter)
        
    Returns:
        List of DateAvailability for each date with slots
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Get all slots for date range
    db = __import__('core.mongo_helper', fromlist=['mongo_db']).mongo_db
    start_normalized = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
    end_normalized = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    slots = db.find_many(
        AvailabilityRepository.COLLECTION,
        {
            "profile_id": profile_id,
            "date": {
                "$gte": start_normalized,
                "$lte": end_normalized
            }
        },
        sort=[("date", 1), ("time_slot", 1)]
    )
    
    # Group by date
    date_groups = {}
    for slot in slots:
        date_key = slot["date"].strftime("%Y-%m-%d")
        if date_key not in date_groups:
            date_groups[date_key] = []
        date_groups[date_key].append(slot)
    
    # Create DateAvailability responses
    result = []
    for date_key in sorted(date_groups.keys()):
        slots_for_date = date_groups[date_key]
        total_slots = len(slots_for_date)
        available_slots = len([s for s in slots_for_date if s["is_available"]])
        
        result.append(DateAvailability(
            date=slots_for_date[0]["date"],
            total_slots=total_slots,
            available_slots=available_slots,
            slots=[AvailabilitySlot(**s) for s in slots_for_date]
        ))
    
    return result


@router.get("/profiles/{profile_id}/dates/{date}", response_model=DateAvailability)
async def get_slots_for_date(
    profile_id: str,
    date: datetime,
):
    """
    Get availability slots for a specific date.
    Public endpoint.
    
    Args:
        profile_id: Profile ID
        date: Date to get slots for
        
    Returns:
        DateAvailability with all slots for that date
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    slots = AvailabilityRepository.get_available_slots(profile_id, date)
    available_count = len([s for s in slots if s.is_available])
    
    return DateAvailability(
        date=date.replace(hour=0, minute=0, second=0, microsecond=0),
        total_slots=len(slots),
        available_slots=available_count,
        slots=slots
    )


@router.put("/slots/{slot_id}", response_model=AvailabilitySlot)
async def update_slot_capacity(
    slot_id: str,
    update_data: SlotCapacityUpdate,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Update the capacity of an availability slot.
    Only profile owner can update slots.
    
    Args:
        slot_id: Slot ID
        update_data: Request body with new max_capacity
        current_user: Authenticated owner user
        
    Returns:
        Updated AvailabilitySlot
        
    Raises:
        HTTPException: If slot not found or user is not the owner
    """
    slot = AvailabilityRepository.get_slot(slot_id)
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )
    
    # Verify ownership
    profile = ProfileRepository.get_profile(slot["profile_id"])
    if not profile or profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can update slots"
        )
    
    AvailabilityRepository.update_slot_capacity(slot_id, update_data.max_capacity)
    updated_slot = AvailabilityRepository.get_slot(slot_id)
    
    return AvailabilitySlot(**updated_slot)


@router.delete("/slots/{slot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_slot(
    slot_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Delete an availability slot.
    Only profile owner can delete slots.
    
    Args:
        slot_id: Slot ID
        current_user: Authenticated owner user
        
    Raises:
        HTTPException: If slot not found or user is not the owner
    """
    slot = AvailabilityRepository.get_slot(slot_id)
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slot not found"
        )
    
    # Verify ownership
    profile = ProfileRepository.get_profile(slot["profile_id"])
    if not profile or profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can delete slots"
        )
    
    AvailabilityRepository.delete_slot(slot_id)
