import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
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
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
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
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
        query = {
            "profile_id": profile_id,
            "date": date_normalized
        }

        print(query)
        slots = mongo_db.find_many(
            AvailabilityRepository.COLLECTION,
            query,
            sort=[("time_slot", 1)]
        )

        print(slots)
        
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
            date: Date to check
            time_slot: Time slot string
            
        Returns:
            True if slot has capacity, False otherwise
        """
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
        slot = mongo_db.find_one(
            AvailabilityRepository.COLLECTION,
            {
                "profile_id": profile_id,
                "date": date_normalized,
                "time_slot": time_slot
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
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
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
    
    @staticmethod
    def get_dates_with_bookings(profile_id: str, dates: list) -> list:
        """
        Check which dates have ACTIVE bookings (PENDING or CONFIRMED).
        Dates with only REJECTED/CANCELLED bookings are NOT protected.
        
        Args:
            profile_id: Profile ID
            dates: List of datetime objects to check
            
        Returns:
            List of date strings (YYYY-MM-DD) that have active bookings
        """
        from modules.bookings.models import BookingStatus
        
        dates_with_bookings = []
        
        # Active statuses that should protect a slot from deletion
        active_statuses = [
            BookingStatus.PENDING.value,
            BookingStatus.CONFIRMED.value,
        ]
        
        for date in dates:
            date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
            date_end = date_normalized.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # Check the BOOKINGS collection for active bookings on this date
            # This properly handles cases where bookings are rejected/cancelled
            active_booking = mongo_db.find_one(
                "bookings",  # Query bookings collection, not availability_slots
                {
                    "profile_id": profile_id,
                    "booking_date": {"$gte": date_normalized, "$lte": date_end},
                    "status": {"$in": active_statuses}
                }
            )
            
            if active_booking:
                dates_with_bookings.append(date_normalized.strftime("%Y-%m-%d"))
        
        return dates_with_bookings
    
    @staticmethod
    def delete_slots_for_date(profile_id: str, date: datetime) -> int:
        """
        Delete all slots for a specific date.
        
        Args:
            profile_id: Profile ID
            date: Date to delete slots for
            
        Returns:
            Number of deleted slots
        """
        date_normalized = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        date_end = date_normalized.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        result = mongo_db.delete_many(
            AvailabilityRepository.COLLECTION,
            {
                "profile_id": profile_id,
                "date": {"$gte": date_normalized, "$lte": date_end}
            }
        )
        
        return result
    
    @staticmethod
    def bulk_delete_slots(profile_id: str, dates: list) -> dict:
        """
        Delete slots for multiple dates, skipping dates with bookings.
        
        Args:
            profile_id: Profile ID
            dates: List of datetime objects
            
        Returns:
            Dict with success_count, failed_count, protected_dates
        """
        # First check which dates have bookings
        protected_dates = AvailabilityRepository.get_dates_with_bookings(profile_id, dates)
        
        success_count = 0
        failed_dates = []
        
        for date in dates:
            date_str = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc).strftime("%Y-%m-%d")
            
            # Skip protected dates
            if date_str in protected_dates:
                continue
            
            try:
                deleted = AvailabilityRepository.delete_slots_for_date(profile_id, date)
                if deleted > 0:
                    success_count += 1
            except Exception as e:
                failed_dates.append(date_str)
        
        return {
            "success_count": success_count,
            "failed_count": len(failed_dates),
            "failed_dates": failed_dates,
            "protected_dates": protected_dates
        }


class SlotTemplateRepository:
    """Repository for slot template operations."""
    
    COLLECTION = "slot_templates"
    
    @staticmethod
    def create_template(owner_id: str, name: str, slots: List[Dict[str, str]], is_default: bool = False) -> Dict[str, Any]:
        """
        Create a new slot template.
        
        Args:
            owner_id: Owner's user ID
            name: Template name
            slots: List of slot definitions with start_time and end_time
            is_default: Whether this is the default template
            
        Returns:
            Created template document
        """
        # If setting as default, unset other defaults first
        if is_default:
            mongo_db.update_many(
                SlotTemplateRepository.COLLECTION,
                {"owner_id": owner_id, "is_default": True},
                {"$set": {"is_default": False, "updated_at": datetime.utcnow()}}
            )
        
        template_doc = {
            "id": str(uuid.uuid4()),
            "owner_id": owner_id,
            "name": name,
            "slots": slots,
            "is_default": is_default,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        mongo_db.insert_one(SlotTemplateRepository.COLLECTION, template_doc)
        return template_doc
    
    @staticmethod
    def get_templates_by_owner(owner_id: str) -> List[Dict[str, Any]]:
        """Get all templates for an owner."""
        return mongo_db.find_many(
            SlotTemplateRepository.COLLECTION,
            {"owner_id": owner_id},
            sort=[("is_default", -1), ("name", 1)]
        )
    
    @staticmethod
    def get_template(template_id: str) -> Optional[Dict[str, Any]]:
        """Get a template by ID."""
        return mongo_db.find_one(SlotTemplateRepository.COLLECTION, {"id": template_id})
    
    @staticmethod
    def update_template(template_id: str, updates: Dict[str, Any], owner_id: str) -> Optional[Dict[str, Any]]:
        """
        Update a template.
        
        Args:
            template_id: Template ID
            updates: Fields to update
            owner_id: Owner ID (for default handling)
            
        Returns:
            Updated template or None
        """
        template = SlotTemplateRepository.get_template(template_id)
        if not template:
            return None
        
        # If setting as default, unset other defaults first
        if updates.get("is_default") is True:
            mongo_db.update_many(
                SlotTemplateRepository.COLLECTION,
                {"owner_id": owner_id, "is_default": True, "id": {"$ne": template_id}},
                {"$set": {"is_default": False, "updated_at": datetime.utcnow()}}
            )
        
        updates["updated_at"] = datetime.utcnow()
        
        mongo_db.update_one(
            SlotTemplateRepository.COLLECTION,
            {"id": template_id},
            {"$set": updates}
        )
        
        return SlotTemplateRepository.get_template(template_id)
    
    @staticmethod
    def delete_template(template_id: str) -> int:
        """Delete a template."""
        return mongo_db.delete_one(SlotTemplateRepository.COLLECTION, {"id": template_id})
    
    @staticmethod
    def get_default_template(owner_id: str) -> Optional[Dict[str, Any]]:
        """Get the default template for an owner."""
        return mongo_db.find_one(
            SlotTemplateRepository.COLLECTION,
            {"owner_id": owner_id, "is_default": True}
        )
    
    @staticmethod
    def generate_slots_preview(
        start_time: str,
        end_time: str,
        slot_duration: int,
        break_start: Optional[str] = None,
        break_end: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Generate a preview of slots based on configuration.
        
        Args:
            start_time: Start time (HH:MM)
            end_time: End time (HH:MM)
            slot_duration: Duration of each slot in minutes
            break_start: Optional break start time
            break_end: Optional break end time
            
        Returns:
            List of slot definitions with start_time and end_time
        """
        slots = []
        
        # Parse times
        start_parts = start_time.split(":")
        end_parts = end_time.split(":")
        start_hour, start_min = int(start_parts[0]), int(start_parts[1])
        end_hour, end_min = int(end_parts[0]), int(end_parts[1])
        
        # Parse break times if provided
        break_start_minutes = None
        break_end_minutes = None
        if break_start and break_end:
            bs_parts = break_start.split(":")
            be_parts = break_end.split(":")
            break_start_minutes = int(bs_parts[0]) * 60 + int(bs_parts[1])
            break_end_minutes = int(be_parts[0]) * 60 + int(be_parts[1])
        
        current_hour = start_hour
        current_min = start_min
        
        while True:
            # Calculate slot end time
            slot_end_min = current_min + slot_duration
            slot_end_hour = current_hour
            
            if slot_end_min >= 60:
                slot_end_hour += slot_end_min // 60
                slot_end_min = slot_end_min % 60
            
            # Check if we've exceeded the end time
            if slot_end_hour > end_hour or (slot_end_hour == end_hour and slot_end_min > end_min):
                break
            
            # Check if slot is during break
            if break_start_minutes is not None and break_end_minutes is not None:
                slot_start_minutes = current_hour * 60 + current_min
                slot_end_minutes = slot_end_hour * 60 + slot_end_min
                
                # Skip if slot overlaps with break
                if not (slot_end_minutes <= break_start_minutes or slot_start_minutes >= break_end_minutes):
                    # Move to after break
                    current_hour = break_end_minutes // 60
                    current_min = break_end_minutes % 60
                    continue
            
            # Add slot
            slots.append({
                "start_time": f"{current_hour:02d}:{current_min:02d}",
                "end_time": f"{slot_end_hour:02d}:{slot_end_min:02d}"
            })
            
            # Move to next slot
            current_min = slot_end_min
            current_hour = slot_end_hour
        
        return slots
