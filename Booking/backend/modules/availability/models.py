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


class DateAvailability(BaseModel):
    """Availability summary for a specific date."""
    date: datetime
    total_slots: int
    available_slots: int
    slots: List[AvailabilitySlot]
