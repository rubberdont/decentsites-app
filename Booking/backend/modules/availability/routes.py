from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
import uuid

from modules.auth.security import get_current_user
from modules.auth.models import UserCredentials
from modules.profiles.repository import ProfileRepository
from .models import (
    AvailabilityCreate, AvailabilitySlot, DateAvailability, SlotCapacityUpdate,
    SlotTemplate, SlotTemplateCreate, SlotTemplateUpdate, 
    ApplyTemplateRequest, GenerateTemplatePreview, TemplateSlot,
    BulkApplyTemplateRequest, BulkDeleteSlotsRequest, BulkOperationResult
)
from .repository import AvailabilityRepository, SlotTemplateRepository


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


# ============================================================================
# SLOT TEMPLATES ENDPOINTS
# ============================================================================


@router.get("/templates", response_model=List[SlotTemplate])
async def list_templates(
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    List all slot templates for the current user.
    
    Returns:
        List of SlotTemplate
    """
    templates = SlotTemplateRepository.get_templates_by_owner(current_user.user_id)
    return [SlotTemplate(**t) for t in templates]


@router.post("/templates", response_model=SlotTemplate, status_code=status.HTTP_201_CREATED)
async def create_template(
    template_data: SlotTemplateCreate,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Create a new slot template.
    
    Args:
        template_data: Template name, slots, and default flag
        current_user: Authenticated user
        
    Returns:
        Created SlotTemplate
    """
    slots = [{"start_time": s.start_time, "end_time": s.end_time} for s in template_data.slots]
    
    template = SlotTemplateRepository.create_template(
        owner_id=current_user.user_id,
        name=template_data.name,
        slots=slots,
        is_default=template_data.is_default
    )
    
    return SlotTemplate(**template)


@router.post("/templates/preview", response_model=List[TemplateSlot])
async def generate_template_preview(
    config: GenerateTemplatePreview,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Generate a preview of slots based on configuration.
    Does not create anything, just returns the slot definitions.
    
    Args:
        config: Start time, end time, duration, and optional break
        current_user: Authenticated user
        
    Returns:
        List of TemplateSlot with start_time and end_time
    """
    slots = SlotTemplateRepository.generate_slots_preview(
        start_time=config.start_time,
        end_time=config.end_time,
        slot_duration=config.slot_duration,
        break_start=config.break_start,
        break_end=config.break_end
    )
    
    return [TemplateSlot(**s) for s in slots]


@router.get("/templates/{template_id}", response_model=SlotTemplate)
async def get_template(
    template_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Get a specific template by ID.
    
    Args:
        template_id: Template ID
        current_user: Authenticated user
        
    Returns:
        SlotTemplate
        
    Raises:
        HTTPException: If template not found or not owned by user
    """
    template = SlotTemplateRepository.get_template(template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if template["owner_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this template"
        )
    
    return SlotTemplate(**template)


@router.put("/templates/{template_id}", response_model=SlotTemplate)
async def update_template(
    template_id: str,
    update_data: SlotTemplateUpdate,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Update a slot template.
    
    Args:
        template_id: Template ID
        update_data: Fields to update
        current_user: Authenticated user
        
    Returns:
        Updated SlotTemplate
        
    Raises:
        HTTPException: If template not found or not owned by user
    """
    template = SlotTemplateRepository.get_template(template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if template["owner_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this template"
        )
    
    # Build updates dict
    updates = {}
    if update_data.name is not None:
        updates["name"] = update_data.name
    if update_data.slots is not None:
        updates["slots"] = [{"start_time": s.start_time, "end_time": s.end_time} for s in update_data.slots]
    if update_data.is_default is not None:
        updates["is_default"] = update_data.is_default
    
    updated = SlotTemplateRepository.update_template(template_id, updates, current_user.user_id)
    
    return SlotTemplate(**updated)


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Delete a slot template.
    
    Args:
        template_id: Template ID
        current_user: Authenticated user
        
    Raises:
        HTTPException: If template not found or not owned by user
    """
    template = SlotTemplateRepository.get_template(template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if template["owner_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this template"
        )
    
    SlotTemplateRepository.delete_template(template_id)


@router.post("/profiles/{profile_id}/apply-template", response_model=List[AvailabilitySlot])
async def apply_template_to_date(
    profile_id: str,
    request: ApplyTemplateRequest,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Apply a slot template to a specific date.
    Creates availability slots based on the template.
    
    Args:
        profile_id: Profile ID
        request: Template ID, date, and max capacity
        current_user: Authenticated user
        
    Returns:
        List of created AvailabilitySlot
        
    Raises:
        HTTPException: If profile/template not found or user is not authorized
    """
    # Verify profile ownership
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can apply templates"
        )
    
    # Get template
    template = SlotTemplateRepository.get_template(request.template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if template["owner_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this template"
        )
    
    # Normalize date to midnight
    date_normalized = request.date.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Create slots from template
    created_slots = []
    for slot_def in template["slots"]:
        time_slot = f"{slot_def['start_time']}-{slot_def['end_time']}"
        
        slot_doc = {
            "id": str(uuid.uuid4()),
            "profile_id": profile_id,
            "date": date_normalized,
            "time_slot": time_slot,
            "max_capacity": request.max_capacity,
            "booked_count": 0,
            "is_available": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        db = __import__('core.mongo_helper', fromlist=['mongo_db']).mongo_db
        db.insert_one(AvailabilityRepository.COLLECTION, slot_doc)
        created_slots.append(slot_doc)
    
    return [AvailabilitySlot(**s) for s in created_slots]


# ============================================================================
# BULK OPERATIONS ENDPOINTS
# ============================================================================


@router.post("/profiles/{profile_id}/bulk-apply-template", response_model=BulkOperationResult)
async def bulk_apply_template(
    profile_id: str,
    request: BulkApplyTemplateRequest,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Apply a slot template to multiple dates.
    Creates availability slots based on the template for each date.
    
    Args:
        profile_id: Profile ID
        request: Template ID, list of dates, and max capacity
        current_user: Authenticated user
        
    Returns:
        BulkOperationResult with success/failure counts
    """
    # Verify profile ownership
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can apply templates"
        )
    
    # Get template
    template = SlotTemplateRepository.get_template(request.template_id)
    
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found"
        )
    
    if template["owner_id"] != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to use this template"
        )
    
    db = __import__('core.mongo_helper', fromlist=['mongo_db']).mongo_db
    
    success_count = 0
    failed_dates = []
    
    for date in request.dates:
        try:
            # Normalize date to midnight
            date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Delete existing slots for this date first (optional: could make this configurable)
            AvailabilityRepository.delete_slots_for_date(profile_id, date_normalized)
            
            # Create slots from template
            for slot_def in template["slots"]:
                time_slot = f"{slot_def['start_time']}-{slot_def['end_time']}"
                
                slot_doc = {
                    "id": str(uuid.uuid4()),
                    "profile_id": profile_id,
                    "date": date_normalized,
                    "time_slot": time_slot,
                    "max_capacity": request.max_capacity,
                    "booked_count": 0,
                    "is_available": True,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }
                
                db.insert_one(AvailabilityRepository.COLLECTION, slot_doc)
            
            success_count += 1
        except Exception as e:
            failed_dates.append(date_normalized.strftime("%Y-%m-%d"))
    
    return BulkOperationResult(
        success_count=success_count,
        failed_count=len(failed_dates),
        failed_dates=failed_dates,
        protected_dates=[]
    )


@router.delete("/profiles/{profile_id}/bulk-delete-slots", response_model=BulkOperationResult)
async def bulk_delete_slots(
    profile_id: str,
    request: BulkDeleteSlotsRequest,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Delete availability slots from multiple dates.
    Dates with existing bookings are protected and will not be deleted.
    
    Args:
        profile_id: Profile ID
        request: List of dates to delete slots from
        current_user: Authenticated user
        
    Returns:
        BulkOperationResult with success/failure counts and protected dates
    """
    # Verify profile ownership
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can delete slots"
        )
    
    # Use the bulk delete method from repository
    result = AvailabilityRepository.bulk_delete_slots(profile_id, request.dates)
    
    return BulkOperationResult(
        success_count=result["success_count"],
        failed_count=result["failed_count"],
        failed_dates=result["failed_dates"],
        protected_dates=result["protected_dates"]
    )