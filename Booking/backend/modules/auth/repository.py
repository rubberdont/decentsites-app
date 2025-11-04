import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from core.mongo_helper import mongo_db


class AuthRepository:
    """Repository for user authentication operations."""
    
    COLLECTION = "users"
    
    @staticmethod
    def user_exists(username: str) -> bool:
        """Check if username already exists."""
        user = mongo_db.find_one(AuthRepository.COLLECTION, {"username": username})
        return user is not None
    
    @staticmethod
    def create_user(
        username: str,
        name: str,
        password_hash: str,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a new user.
        
        Args:
            username: Unique username
            name: User's full name
            password_hash: Hashed password
            email: Optional email address
            
        Returns:
            Created user document
        """
        user_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        user_doc = {
            "id": user_id,
            "username": username,
            "name": name,
            "email": email,
            "password_hash": password_hash,
            "created_at": now,
            "updated_at": now,
        }
        
        mongo_db.insert_one(AuthRepository.COLLECTION, user_doc)
        return user_doc
    
    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Get user by username."""
        return mongo_db.find_one(AuthRepository.COLLECTION, {"username": username})
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        return mongo_db.find_one(AuthRepository.COLLECTION, {"id": user_id})
    
    @staticmethod
    def update_user(user_id: str, updates: Dict[str, Any]) -> int:
        """Update user fields."""
        updates["updated_at"] = datetime.utcnow()
        return mongo_db.update_one(
            AuthRepository.COLLECTION,
            {"id": user_id},
            {"$set": updates}
        )
