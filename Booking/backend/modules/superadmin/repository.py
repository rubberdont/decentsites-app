from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid
from core.mongo_helper import mongo_db
from core.security import hash_password


DEFAULT_PASSWORD = "changeme123"  # Default password for new owners


class SuperadminRepository:
    """Repository for superadmin owner management operations."""
    
    @staticmethod
    def get_owners(
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        include_deleted: bool = False
    ) -> tuple[List[Dict[str, Any]], int]:
        """Get paginated list of owners."""
        db = mongo_db.get_database()
        
        query: Dict[str, Any] = {"role": "OWNER"}
        if not include_deleted:
            query["is_deleted"] = {"$ne": True}
        
        if search:
            query["$or"] = [
                {"username": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}},
                {"email": {"$regex": search, "$options": "i"}},
            ]
        
        total = db.users.count_documents(query)
        owners = list(db.users.find(query).skip(skip).limit(limit).sort("created_at", -1))
        
        # Add profile count for each owner
        for owner in owners:
            owner["profile_count"] = db.profiles.count_documents({"owner_id": owner["id"]})
        
        return owners, total
    
    @staticmethod
    def get_owner_by_id(owner_id: str) -> Optional[Dict[str, Any]]:
        """Get owner by ID."""
        db = mongo_db.get_database()
        owner = db.users.find_one({"id": owner_id, "role": "OWNER"})
        if owner:
            owner["profile_count"] = db.profiles.count_documents({"owner_id": owner_id})
        return owner
    
    @staticmethod
    def get_owner_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Get owner by username."""
        db = mongo_db.get_database()
        return db.users.find_one({"username": username})
    
    @staticmethod
    def create_owner(
        username: str,
        name: str,
        email: Optional[str] = None,
        password: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new owner with default profile."""
        db = mongo_db.get_database()
        
        # Use default password if not provided
        actual_password = password or DEFAULT_PASSWORD
        password_hash = hash_password(actual_password)
        
        owner_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        owner_doc = {
            "id": owner_id,
            "username": username,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "role": "OWNER",
            "is_active": True,
            "is_deleted": False,
            "must_change_password": password is None,  # Must change if using default
            "created_at": now,
            "updated_at": now,
        }
        
        db.users.insert_one(owner_doc)
        
        # Create default profile for the owner
        profile_id = str(uuid.uuid4())
        profile_doc = {
            "id": profile_id,
            "owner_id": owner_id,
            "owner_name": name,
            "name": f"{name}'s Business",
            "description": "Default business profile - please update",
            "services": [],
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        
        db.profiles.insert_one(profile_doc)
        
        owner_doc["profile_count"] = 1
        return owner_doc
    
    @staticmethod
    def update_owner(owner_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update owner details."""
        db = mongo_db.get_database()
        
        updates["updated_at"] = datetime.utcnow()
        
        result = db.users.update_one(
            {"id": owner_id, "role": "OWNER"},
            {"$set": updates}
        )
        
        if result.modified_count > 0:
            return SuperadminRepository.get_owner_by_id(owner_id)
        return None
    
    @staticmethod
    def soft_delete_owner(owner_id: str) -> bool:
        """Soft delete an owner (mark as deleted)."""
        db = mongo_db.get_database()
        
        result = db.users.update_one(
            {"id": owner_id, "role": "OWNER"},
            {"$set": {"is_deleted": True, "is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    def restore_owner(owner_id: str) -> Optional[Dict[str, Any]]:
        """Restore a soft-deleted owner."""
        db = mongo_db.get_database()
        
        result = db.users.update_one(
            {"id": owner_id, "role": "OWNER", "is_deleted": True},
            {"$set": {"is_deleted": False, "is_active": True, "updated_at": datetime.utcnow()}}
        )
        
        if result.modified_count > 0:
            return SuperadminRepository.get_owner_by_id(owner_id)
        return None
    
    @staticmethod
    def reset_owner_password(owner_id: str) -> bool:
        """Reset owner password to default."""
        db = mongo_db.get_database()
        
        password_hash = hash_password(DEFAULT_PASSWORD)
        
        result = db.users.update_one(
            {"id": owner_id, "role": "OWNER"},
            {"$set": {
                "password_hash": password_hash,
                "must_change_password": True,
                "updated_at": datetime.utcnow()
            }}
        )
        
        return result.modified_count > 0
