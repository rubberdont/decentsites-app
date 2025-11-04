import uuid
import secrets
from typing import Optional, Dict, Any, List
from datetime import datetime
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
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new booking.
        
        Args:
            user_id: User creating the booking
            profile_id: Profile being booked
            booking_date: Date/time of booking
            service_id: Optional service ID
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
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start + timedelta(days=1)
        
        return mongo_db.count_documents(
            BookingRepository.COLLECTION,
            {
                "profile_id": profile_id,
                "booking_date": {"$gte": date_start, "$lt": date_end},
                "status": {"$ne": BookingStatus.CANCELLED.value}
            }
        )
