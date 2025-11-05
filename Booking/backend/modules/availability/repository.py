import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from core.mongo_helper import mongo_db
from .models import TimeSlotConfig, AvailabilitySlot, DateAvailability


class AvailabilityRepository:
    """Repository for availability slot operations."""
    
    COLLECTION = "availability_slots"
    
    @staticmethod
    def create_slots_for_date(
        profile_id: str,
        date: datetime,
        config: TimeSlotConfig
    ) -> List[Dict[str, Any]]:
        """
        Create availability slots for a date.
        
        Args:
            profile_id: Profile ID
            date: Date to create slots for (normalized to midnight)
            config: TimeSlotConfig with start_time, end_time, slot_duration, max_capacity
            
        Returns:
            List of created slot documents
        """
        # Normalize date to midnight
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Parse times
        start_parts = config.start_time.split(":")
        end_parts = config.end_time.split(":")
        start_hour, start_min = int(start_parts[0]), int(start_parts[1])
        end_hour, end_min = int(end_parts[0]), int(end_parts[1])
        
        # Generate slots
        created_slots = []
        current_hour = start_hour
        current_min = start_min
        
        while True:
            # Create slot end time
            slot_end_min = current_min + config.slot_duration
            slot_end_hour = current_hour
            
            if slot_end_min >= 60:
                slot_end_hour += slot_end_min // 60
                slot_end_min = slot_end_min % 60
            
            # Check if we've exceeded the end time
            if slot_end_hour > end_hour or (slot_end_hour == end_hour and slot_end_min > end_min):
                break
            
            # Create time slot string
            time_slot = f"{current_hour:02d}:{current_min:02d}-{slot_end_hour:02d}:{slot_end_min:02d}"
            
            slot_doc = {
                "id": str(uuid.uuid4()),
                "profile_id": profile_id,
                "date": date_normalized,
                "time_slot": time_slot,
                "max_capacity": config.max_capacity_per_slot,
                "booked_count": 0,
                "is_available": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            
            mongo_db.insert_one(AvailabilityRepository.COLLECTION, slot_doc)
            created_slots.append(slot_doc)
            
            # Move to next slot
            current_min = slot_end_min
            current_hour = slot_end_hour
        
        return created_slots
    
    @staticmethod
    def get_available_slots(profile_id: str, date: datetime) -> List[AvailabilitySlot]:
        """
        Get available slots for a profile on a specific date.
        
        Args:
            profile_id: Profile ID
            date: Date to get slots for
            
        Returns:
            List of AvailabilitySlot
        """
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        slots = mongo_db.find_many(
            AvailabilityRepository.COLLECTION,
            {
                "profile_id": profile_id,
                "date": date_normalized
            },
            sort=[("time_slot", 1)]
        )
        
        return [AvailabilitySlot(**s) for s in slots]
    
    @staticmethod
    def check_slot_availability(
        profile_id: str,
        date: datetime,
        time_slot: str
    ) -> bool:
        """
        Check if a specific slot is available.
        
        Args:
            profile_id: Profile ID
            date: Date of slot
            time_slot: Time slot string (HH:MM-HH:MM)
            
        Returns:
            True if slot has capacity, False otherwise
        """
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        slot = mongo_db.find_one(
            AvailabilityRepository.COLLECTION,
            {
                "profile_id": profile_id,
                "date": date_normalized,
                "time_slot": time_slot
            }
        )
        
        if not slot:
            return False
        
        return slot["booked_count"] < slot["max_capacity"]
    
    @staticmethod
    def increment_booked_count(slot_id: str) -> int:
        """
        Increment booked count for a slot.
        
        Args:
            slot_id: Slot ID
            
        Returns:
            Number of modified documents
        """
        slot = mongo_db.find_one(AvailabilityRepository.COLLECTION, {"id": slot_id})
        
        if not slot:
            return 0
        
        new_count = slot["booked_count"] + 1
        is_available = new_count < slot["max_capacity"]
        
        return mongo_db.update_one(
            AvailabilityRepository.COLLECTION,
            {"id": slot_id},
            {
                "$set": {
                    "booked_count": new_count,
                    "is_available": is_available,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def decrement_booked_count(slot_id: str) -> int:
        """
        Decrement booked count for a slot.
        
        Args:
            slot_id: Slot ID
            
        Returns:
            Number of modified documents
        """
        slot = mongo_db.find_one(AvailabilityRepository.COLLECTION, {"id": slot_id})
        
        if not slot or slot["booked_count"] <= 0:
            return 0
        
        new_count = slot["booked_count"] - 1
        is_available = new_count < slot["max_capacity"]
        
        return mongo_db.update_one(
            AvailabilityRepository.COLLECTION,
            {"id": slot_id},
            {
                "$set": {
                    "booked_count": new_count,
                    "is_available": is_available,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def update_slot_capacity(slot_id: str, new_capacity: int) -> int:
        """
        Update max capacity for a slot.
        
        Args:
            slot_id: Slot ID
            new_capacity: New max capacity
            
        Returns:
            Number of modified documents
        """
        slot = mongo_db.find_one(AvailabilityRepository.COLLECTION, {"id": slot_id})
        
        if not slot:
            return 0
        
        is_available = slot["booked_count"] < new_capacity
        
        return mongo_db.update_one(
            AvailabilityRepository.COLLECTION,
            {"id": slot_id},
            {
                "$set": {
                    "max_capacity": new_capacity,
                    "is_available": is_available,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    @staticmethod
    def get_slot(slot_id: str) -> Optional[Dict[str, Any]]:
        """Get a slot by ID."""
        return mongo_db.find_one(AvailabilityRepository.COLLECTION, {"id": slot_id})
    
    @staticmethod
    def delete_slot(slot_id: str) -> int:
        """Delete a slot."""
        return mongo_db.delete_one(AvailabilityRepository.COLLECTION, {"id": slot_id})
