import uuid
import secrets
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from core.mongo_helper import mongo_db
from .models import BookingStatus


class BookingRepository:
    """Repository for booking operations."""
    
    COLLECTION = "bookings"
    
    @staticmethod
    def generate_booking_ref() -> str:
        """
        Generate a unique 6-8 character alphanumeric booking reference.
        
        Returns:
            Booking reference string
        """
        # Generate 6-8 char alphanumeric code using hex
        # secrets.token_hex(3) gives 6 chars, (4) gives 8 chars
        return secrets.token_hex(3).upper()
    
    @staticmethod
    def _booking_ref_exists(booking_ref: str) -> bool:
        """Check if booking reference already exists."""
        return mongo_db.find_one(BookingRepository.COLLECTION, {"booking_ref": booking_ref}) is not None
    
    @staticmethod
    def _get_unique_booking_ref() -> str:
        """Generate unique booking reference with collision handling."""
        while True:
            ref = BookingRepository.generate_booking_ref()
            if not BookingRepository._booking_ref_exists(ref):
                return ref
    
    @staticmethod
    def create_booking(
        user_id: str,
        profile_id: str,
        booking_date: datetime,
        service_id: Optional[str] = None,
        time_slot: Optional[str] = None,  # NEW
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new booking.
        
        Args:
            user_id: User creating the booking
            profile_id: Profile being booked
            booking_date: Date/time of booking
            service_id: Optional service ID
            time_slot: Optional time slot (e.g., "09:00-10:00")
            notes: Optional booking notes
            
        Returns:
            Created booking document
        """
        booking_id = str(uuid.uuid4())
        booking_ref = BookingRepository._get_unique_booking_ref()
        now = datetime.utcnow()
        
        booking_doc = {
            "id": booking_id,
            "booking_ref": booking_ref,
            "user_id": user_id,
            "profile_id": profile_id,
            "service_id": service_id,
            "booking_date": booking_date,
            "time_slot": time_slot,  # NEW
            "status": BookingStatus.PENDING.value,
            "notes": notes,
            "created_at": now,
            "updated_at": now,
        }
        
        mongo_db.insert_one(BookingRepository.COLLECTION, booking_doc)
        return booking_doc
    
    @staticmethod
    def get_booking_by_id(booking_id: str) -> Optional[Dict[str, Any]]:
        """Get booking by ID."""
        return mongo_db.find_one(BookingRepository.COLLECTION, {"id": booking_id})
    
    @staticmethod
    def get_booking_by_ref(booking_ref: str) -> Optional[Dict[str, Any]]:
        """Get booking by reference number."""
        return mongo_db.find_one(BookingRepository.COLLECTION, {"booking_ref": booking_ref})
    
    @staticmethod
    def get_user_bookings(user_id: str) -> List[Dict[str, Any]]:
        """Get all bookings for a user."""
        return mongo_db.find_many(BookingRepository.COLLECTION, {"user_id": user_id})
    
    @staticmethod
    def get_profile_bookings(profile_id: str) -> List[Dict[str, Any]]:
        """Get all bookings for a profile."""
        return mongo_db.find_many(BookingRepository.COLLECTION, {"profile_id": profile_id})
    
    @staticmethod
    def get_profile_bookings_by_status(profile_id: str, status: str) -> List[Dict[str, Any]]:
        """Get bookings for profile with specific status."""
        return mongo_db.find_many(
            BookingRepository.COLLECTION,
            {"profile_id": profile_id, "status": status}
        )
    
    @staticmethod
    def update_booking_status(booking_id: str, status: BookingStatus) -> int:
        """
        Update booking status.
        
        Args:
            booking_id: Booking ID to update
            status: New status
            
        Returns:
            Number of modified documents
        """
        return mongo_db.update_one(
            BookingRepository.COLLECTION,
            {"id": booking_id},
            {"$set": {
                "status": status.value,
                "updated_at": datetime.utcnow()
            }}
        )
    
    @staticmethod
    def cancel_booking(booking_id: str) -> int:
        """
        Cancel a booking (sets status to CANCELLED).
        
        Args:
            booking_id: Booking ID to cancel
            
        Returns:
            Number of modified documents
        """
        return BookingRepository.update_booking_status(booking_id, BookingStatus.CANCELLED)
    
    @staticmethod
    def delete_booking(booking_id: str) -> int:
        """Delete a booking."""
        return mongo_db.delete_one(BookingRepository.COLLECTION, {"id": booking_id})
    
    @staticmethod
    def count_bookings_for_profile_on_date(profile_id: str, date: datetime) -> int:
        """Count bookings for profile on specific date (excluding cancelled)."""
        # Create date range for the day
        from datetime import timedelta
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        date_end = date_start + timedelta(days=1)
        
        return mongo_db.count_documents(
            BookingRepository.COLLECTION,
            {
                "profile_id": profile_id,
                "booking_date": {"$gte": date_start, "$lt": date_end},
                "status": {"$ne": BookingStatus.CANCELLED.value}
            }
        )
    
    @staticmethod
    def count_confirmed_bookings_for_slot(profile_id: str, booking_date: datetime, time_slot: str) -> int:
        """
        Count CONFIRMED bookings for a specific time slot.
        
        Args:
            profile_id: Profile ID
            booking_date: Booking date (normalized to midnight)
            time_slot: Time slot string (e.g., "09:00-10:00")
            
        Returns:
            Count of confirmed bookings
        """
        # Normalize date to midnight for consistent querying
        date_normalized = booking_date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
        count = mongo_db.count_documents(
            "bookings",
            {
                "profile_id": profile_id,
                "booking_date": date_normalized,
                "time_slot": time_slot,
                "status": "CONFIRMED"
            }
        )
        
        return count
    
    @staticmethod
    def user_has_active_booking_for_slot(user_id: str, profile_id: str, booking_date: datetime, time_slot: str) -> bool:
        """
        Check if user already has an active booking for a specific time slot.
        Active means: PENDING or CONFIRMED status (not CANCELLED or REJECTED).
        
        Args:
            user_id: User ID
            profile_id: Profile ID
            booking_date: Booking date (normalized to midnight)
            time_slot: Time slot string (e.g., "09:00-10:00")
            
        Returns:
            True if user has active booking, False otherwise
        """
        # Normalize date to midnight for consistent querying
        date_normalized = booking_date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
        # Check for existing booking with PENDING or CONFIRMED status
        existing = mongo_db.find_one(
            "bookings",
            {
                "user_id": user_id,
                "profile_id": profile_id,
                "booking_date": date_normalized,
                "time_slot": time_slot,
                "status": {"$in": ["PENDING", "CONFIRMED"]}
            }
        )
        
        return existing is not None

    @staticmethod
    def reschedule_booking(
        booking_id: str,
        new_date: datetime,
        new_time_slot: str,
        notes: Optional[str] = None
    ) -> dict:
        """
        Reschedule a booking to a new date/time.
        
        Args:
            booking_id: Booking ID
            new_date: New booking date
            new_time_slot: New time slot
            notes: Optional notes about the reschedule
            
        Returns:
            Updated booking document
            
        Raises:
            ValueError if booking not found
        """
        booking = mongo_db.find_one("bookings", {"id": booking_id})
        if not booking:
            raise ValueError(f"Booking {booking_id} not found")
        
        # Store original date/time for logging
        old_date = booking.get("booking_date")
        old_slot = booking.get("time_slot")
        
        # Normalize new date to midnight
        new_date_normalized = new_date.replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)
        
        # Update booking
        update_data = {
            "booking_date": new_date_normalized,
            "time_slot": new_time_slot,
            "updated_at": datetime.utcnow()
        }
        
        mongo_db.update_one(
            "bookings",
            {"id": booking_id},
            {"$set": update_data}
        )
        
        # Get updated booking
        updated_booking = mongo_db.find_one("bookings", {"id": booking_id})
        
        return updated_booking
