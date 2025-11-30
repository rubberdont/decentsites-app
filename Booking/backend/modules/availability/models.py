from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class TimeSlotConfig(BaseModel):
    """Configuration for creating time slots."""
    start_time: str = Field(..., description="Start time (HH:MM)")
    end_time: str = Field(..., description="End time (HH:MM)")
    slot_duration: int = Field(..., description="Duration of each slot in minutes")
    max_capacity_per_slot: int = Field(..., description="Max bookings per slot")


class AvailabilitySlot(BaseModel):
    """Availability slot model."""
    id: str
    profile_id: str
    date: datetime
    time_slot: str
    max_capacity: int
    booked_count: int
    is_available: bool


class AvailabilityCreate(BaseModel):
    """Request model for creating availability slots."""
    date: datetime
    config: TimeSlotConfig


class SlotCapacityUpdate(BaseModel):
    """Request model for updating slot capacity."""
    max_capacity: int = Field(..., gt=0, description="New maximum capacity")


class DateAvailability(BaseModel):
    """Availability summary for a specific date."""
    date: datetime
    total_slots: int
    available_slots: int
    slots: List[AvailabilitySlot]


class TemplateSlot(BaseModel):
    """A single slot definition within a template."""
    start_time: str = Field(..., description="Start time (HH:MM)")
    end_time: str = Field(..., description="End time (HH:MM)")


class SlotTemplateCreate(BaseModel):
    """Request model for creating a slot template."""
    name: str = Field(..., min_length=1, max_length=100, description="Template name")
    slots: List[TemplateSlot] = Field(..., description="List of time slots")
    is_default: bool = Field(False, description="Set as default template")


class SlotTemplateUpdate(BaseModel):
    """Request model for updating a slot template."""
    name: Optional[str] = Field(None, min_length=1, max_length=100, description="Template name")
    slots: Optional[List[TemplateSlot]] = Field(None, description="List of time slots")
    is_default: Optional[bool] = Field(None, description="Set as default template")


class SlotTemplate(BaseModel):
    """Slot template model."""
    id: str
    owner_id: str
    name: str
    slots: List[TemplateSlot]
    is_default: bool
    created_at: datetime
    updated_at: datetime


class ApplyTemplateRequest(BaseModel):
    """Request model for applying a template to a date."""
    template_id: str = Field(..., description="Template ID to apply")
    date: datetime = Field(..., description="Date to apply slots to")
    max_capacity: int = Field(1, ge=1, description="Max capacity for each slot (default 1)")


class GenerateTemplatePreview(BaseModel):
    """Request model for generating template slot preview."""
    start_time: str = Field(..., description="Start time (HH:MM)")
    end_time: str = Field(..., description="End time (HH:MM)")
    slot_duration: int = Field(..., ge=5, le=240, description="Duration of each slot in minutes")
    break_start: Optional[str] = Field(None, description="Break start time (HH:MM)")
    break_end: Optional[str] = Field(None, description="Break end time (HH:MM)")


# ============================================================================
# BULK OPERATION MODELS
# ============================================================================


class BulkApplyTemplateRequest(BaseModel):
    """Request model for applying a template to multiple dates."""
    template_id: str = Field(..., description="Template ID to apply")
    dates: List[datetime] = Field(..., description="List of dates to apply template to")
    max_capacity: int = Field(1, ge=1, description="Max capacity for each slot (default 1)")


class BulkDeleteSlotsRequest(BaseModel):
    """Request model for deleting slots from multiple dates."""
    dates: List[datetime] = Field(..., description="List of dates to delete slots from")


class BulkOperationResult(BaseModel):
    """Response model for bulk operations."""
    success_count: int = Field(..., description="Number of successful operations")
    failed_count: int = Field(0, description="Number of failed operations")
    failed_dates: List[str] = Field(default_factory=list, description="Dates that failed (YYYY-MM-DD format)")
    protected_dates: List[str] = Field(default_factory=list, description="Dates protected due to existing bookings")
