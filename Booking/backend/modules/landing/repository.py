import os
from typing import Optional, Dict, Any
from datetime import datetime
from core.mongo_helper import mongo_db

COLLECTION_NAME = "landing_configs"


class LandingRepository:
    """Repository for landing page configuration CRUD operations."""
    
    @staticmethod
    def get_config_by_owner(owner_id: str) -> Optional[Dict[str, Any]]:
        """Get landing page config for a specific owner."""
        return mongo_db.find_one(COLLECTION_NAME, {"owner_id": owner_id})
    
    @staticmethod
    def get_published_config() -> Optional[Dict[str, Any]]:
        """Get the published landing page config (for public frontend)."""
        # Get the default owner's published config
        default_owner_id = os.getenv("DEFAULT_OWNER_ID")
        if default_owner_id:
            config = mongo_db.find_one(
                COLLECTION_NAME, 
                {"owner_id": default_owner_id, "is_published": True}
            )
            if config:
                return config
        # Fallback: get any published config
        return mongo_db.find_one(COLLECTION_NAME, {"is_published": True})
    
    @staticmethod
    def create_config(config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new landing page config."""
        config_data["created_at"] = datetime.utcnow()
        config_data["updated_at"] = datetime.utcnow()
        mongo_db.insert_one(COLLECTION_NAME, config_data)
        return config_data
    
    @staticmethod
    def update_config(owner_id: str, updates: Dict[str, Any]) -> bool:
        """Update landing page config for an owner."""
        updates["updated_at"] = datetime.utcnow()
        result = mongo_db.update_one(
            COLLECTION_NAME,
            {"owner_id": owner_id},
            {"$set": updates}
        )
        return result > 0
    
    @staticmethod
    def publish_config(owner_id: str) -> bool:
        """Mark config as published."""
        result = mongo_db.update_one(
            COLLECTION_NAME,
            {"owner_id": owner_id},
            {"$set": {"is_published": True, "updated_at": datetime.utcnow()}}
        )
        return result > 0
    
    @staticmethod
    def unpublish_config(owner_id: str) -> bool:
        """Mark config as unpublished (draft)."""
        result = mongo_db.update_one(
            COLLECTION_NAME,
            {"owner_id": owner_id},
            {"$set": {"is_published": False, "updated_at": datetime.utcnow()}}
        )
        return result > 0
    
    @staticmethod
    def delete_config(owner_id: str) -> bool:
        """Delete landing page config."""
        result = mongo_db.delete_one(COLLECTION_NAME, {"owner_id": owner_id})
        return result > 0
    
    @staticmethod
    def config_exists(owner_id: str) -> bool:
        """Check if config exists for owner."""
        return mongo_db.count_documents(COLLECTION_NAME, {"owner_id": owner_id}) > 0
