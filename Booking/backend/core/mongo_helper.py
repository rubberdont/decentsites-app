import os
from typing import Any, Dict, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError


class MongoDBHelper:
    """MongoDB connection manager and CRUD operations utility with singleton pattern."""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def connect(self, connection_string: Optional[str] = None, database_name: Optional[str] = None) -> None:
        """
        Connect to MongoDB.
        
        Args:
            connection_string: MongoDB connection string. If None, uses MONGODB_URI env var.
            database_name: Database name. If None, uses MONGODB_DATABASE env var.
        """
        if self._client is not None:
            return
        
        connection_string = connection_string or os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        database_name = database_name or os.getenv("MONGODB_DATABASE", "booking_app")
        
        try:
            self._client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            self._client.admin.command("ping")
            self._db = self._client[database_name]
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            self._client = None
            self._db = None
            raise ConnectionError(f"Failed to connect to MongoDB: {str(e)}")
    
    def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
    
    def get_database(self):
        """Get the MongoDB database instance."""
        if self._db is None:
            raise RuntimeError("Not connected to MongoDB. Call connect() first.")
        return self._db
    
    def find_one(
        self,
        collection: str,
        filter: Dict[str, Any],
        projection: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Find a single document.
        
        Args:
            collection: Collection name
            filter: Query filter
            projection: Fields to include/exclude
            
        Returns:
            Document as dict or None if not found
        """
        db = self.get_database()
        return db[collection].find_one(filter, projection)
    
    def find_many(
        self,
        collection: str,
        filter: Dict[str, Any] = None,
        projection: Optional[Dict[str, Any]] = None,
        skip: int = 0,
        limit: int = 0,
        sort: Optional[List[tuple]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Find multiple documents.
        
        Args:
            collection: Collection name
            filter: Query filter
            projection: Fields to include/exclude
            skip: Number of documents to skip
            limit: Maximum documents to return (0 = no limit)
            sort: List of (field, direction) tuples
            
        Returns:
            List of documents as dicts
        """
        if filter is None:
            filter = {}
        
        db = self.get_database()
        cursor = db[collection].find(filter, projection).skip(skip)
        
        if limit > 0:
            cursor = cursor.limit(limit)
        
        if sort:
            cursor = cursor.sort(sort)
        
        return list(cursor)
    
    def insert_one(self, collection: str, document: Dict[str, Any]) -> str:
        """
        Insert a single document.
        
        Args:
            collection: Collection name
            document: Document to insert
            
        Returns:
            Inserted document ID
        """
        db = self.get_database()
        result = db[collection].insert_one(document)
        return str(result.inserted_id)
    
    def insert_many(self, collection: str, documents: List[Dict[str, Any]]) -> List[str]:
        """
        Insert multiple documents.
        
        Args:
            collection: Collection name
            documents: List of documents to insert
            
        Returns:
            List of inserted document IDs
        """
        if not documents:
            return []
        
        db = self.get_database()
        result = db[collection].insert_many(documents)
        return [str(id) for id in result.inserted_ids]
    
    def update_one(
        self,
        collection: str,
        filter: Dict[str, Any],
        update: Dict[str, Any],
        upsert: bool = False,
    ) -> int:
        """
        Update a single document.
        
        Args:
            collection: Collection name
            filter: Query filter to find document
            update: Update operations (use MongoDB update operators like $set)
            upsert: Insert if not found
            
        Returns:
            Number of modified documents
        """
        db = self.get_database()
        result = db[collection].update_one(filter, update, upsert=upsert)
        return result.modified_count
    
    def update_many(
        self,
        collection: str,
        filter: Dict[str, Any],
        update: Dict[str, Any],
    ) -> int:
        """
        Update multiple documents.
        
        Args:
            collection: Collection name
            filter: Query filter
            update: Update operations
            
        Returns:
            Number of modified documents
        """
        db = self.get_database()
        result = db[collection].update_many(filter, update)
        return result.modified_count
    
    def delete_one(self, collection: str, filter: Dict[str, Any]) -> int:
        """
        Delete a single document.
        
        Args:
            collection: Collection name
            filter: Query filter
            
        Returns:
            Number of deleted documents
        """
        db = self.get_database()
        result = db[collection].delete_one(filter)
        return result.deleted_count
    
    def delete_many(self, collection: str, filter: Dict[str, Any]) -> int:
        """
        Delete multiple documents.
        
        Args:
            collection: Collection name
            filter: Query filter
            
        Returns:
            Number of deleted documents
        """
        db = self.get_database()
        result = db[collection].delete_many(filter)
        return result.deleted_count
    
    def count_documents(self, collection: str, filter: Dict[str, Any] = None) -> int:
        """
        Count documents matching filter.
        
        Args:
            collection: Collection name
            filter: Query filter
            
        Returns:
            Number of matching documents
        """
        if filter is None:
            filter = {}
        
        db = self.get_database()
        return db[collection].count_documents(filter)
    
    def aggregate(self, collection: str, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Run aggregation pipeline.
        
        Args:
            collection: Collection name
            pipeline: Aggregation pipeline stages
            
        Returns:
            List of aggregation results
        """
        db = self.get_database()
        return list(db[collection].aggregate(pipeline))
    
    def ping(self) -> bool:
        """
        Test database connection.
        
        Returns:
            True if connected, False otherwise
        """
        try:
            if self._client:
                self._client.admin.command("ping")
                return True
            return False
        except Exception:
            return False


# Singleton instance
mongo_db = MongoDBHelper()
