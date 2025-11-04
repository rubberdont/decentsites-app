import uuid
from typing import List, Optional, Dict, Any
from core.mongo_helper import mongo_db
from .models import BusinessProfile, Service


class ProfileRepository:
    """Repository for profile operations following the repository pattern."""
    
    COLLECTION = "profiles"
    
    @staticmethod
    def get_profile(profile_id: str) -> Optional[Dict[str, Any]]:
        """Get a profile by ID."""
        return mongo_db.find_one(ProfileRepository.COLLECTION, {"id": profile_id})
    
    @staticmethod
    def get_all_profiles() -> List[Dict[str, Any]]:
        """Get all profiles."""
        return mongo_db.find_many(ProfileRepository.COLLECTION)
    
    @staticmethod
    def create_profile(profile: BusinessProfile) -> Dict[str, Any]:
        """Create a new profile."""
        if not profile.id:
            profile.id = str(uuid.uuid4())
        
        profile_dict = profile.model_dump()
        mongo_db.insert_one(ProfileRepository.COLLECTION, profile_dict)
        return profile_dict
    
    @staticmethod
    def update_profile(profile_id: str, updates: Dict[str, Any]) -> int:
        """Update a profile. Returns number of modified documents."""
        return mongo_db.update_one(
            ProfileRepository.COLLECTION,
            {"id": profile_id},
            {"$set": updates}
        )
    
    @staticmethod
    def delete_profile(profile_id: str) -> int:
        """Delete a profile. Returns number of deleted documents."""
        return mongo_db.delete_one(ProfileRepository.COLLECTION, {"id": profile_id})
    
    @staticmethod
    def add_service_to_profile(profile_id: str, service: Service) -> int:
        """Add a service to a profile's services array."""
        if not service.id:
            service.id = str(uuid.uuid4())
        
        service_dict = service.model_dump()
        return mongo_db.update_one(
            ProfileRepository.COLLECTION,
            {"id": profile_id},
            {"$push": {"services": service_dict}}
        )
    
    @staticmethod
    def update_service_in_profile(
        profile_id: str,
        service_id: str,
        updates: Dict[str, Any]
    ) -> int:
        """Update a service within a profile."""
        # Build update dict with service fields prefixed
        service_updates = {f"services.$.{key}": value for key, value in updates.items()}
        
        return mongo_db.update_one(
            ProfileRepository.COLLECTION,
            {
                "id": profile_id,
                "services.id": service_id
            },
            {"$set": service_updates}
        )
    
    @staticmethod
    def delete_service_from_profile(profile_id: str, service_id: str) -> int:
        """Delete a service from a profile."""
        return mongo_db.update_one(
            ProfileRepository.COLLECTION,
            {"id": profile_id},
            {"$pull": {"services": {"id": service_id}}}
        )
    
    @staticmethod
    def count_profiles() -> int:
        """Count total number of profiles."""
        return mongo_db.count_documents(ProfileRepository.COLLECTION)
