"""
Admin Repository - Comprehensive data access layer for admin operations.

Provides methods for:
- Paginated booking management with filters and search
- Customer management with statistics
- Dashboard analytics and reporting
- Activity logging
"""

import uuid
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime, timedelta
from core.mongo_helper import mongo_db
from .models import BookingStatus


class AdminRepository:
    """Repository for admin operations with complex queries and aggregations."""
    
    # Collection names
    BOOKINGS = "bookings"
    USERS = "users"
    PROFILES = "profiles"
    ACTIVITIES = "admin_activities"
    BLOCKED_CUSTOMERS = "blocked_customers"
    CUSTOMER_NOTES = "customer_notes"
    BOOKING_NOTES = "booking_notes"
    
    # ===========================
    # BOOKINGS METHODS
    # ===========================
    
    @staticmethod
    def get_bookings_paginated(
        filters: Dict[str, Any],
        page: int = 1,
        page_size: int = 20,
        sort_by: str = "created_at",
        sort_order: int = -1  # -1 for desc, 1 for asc
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get paginated bookings with filters, search, and customer/service info.
        
        Args:
            filters: Dict containing status, search, start_date, end_date, profile_id, service_id
            page: Page number (1-indexed)
            page_size: Number of items per page
            sort_by: Field to sort by
            sort_order: -1 for descending, 1 for ascending
            
        Returns:
            Tuple of (list of bookings with details, total count)
        """
        match_stage = {}
        
        # Profile filter (required for admin to see only their profile's bookings)
        if filters.get("profile_id"):
            match_stage["profile_id"] = filters["profile_id"]
        
        # Status filter
        if filters.get("status"):
            match_stage["status"] = filters["status"]
        
        # Date range filter
        if filters.get("start_date") or filters.get("end_date"):
            date_filter = {}
            if filters.get("start_date"):
                date_filter["$gte"] = filters["start_date"]
            if filters.get("end_date"):
                date_filter["$lte"] = filters["end_date"]
            match_stage["booking_date"] = date_filter
        
        # Service filter
        if filters.get("service_id"):
            match_stage["service_id"] = filters["service_id"]
        
        # Build aggregation pipeline
        pipeline = [
            {"$match": match_stage},
            # Join with users collection for customer info
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "id",
                    "as": "customer"
                }
            },
            {"$unwind": {"path": "$customer", "preserveNullAndEmptyArrays": True}},
            # Join with profiles collection
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
        ]
        
        # Search filter (on customer name, email, or booking_ref)
        if filters.get("search"):
            search_term = filters["search"]
            pipeline.append({
                "$match": {
                    "$or": [
                        {"customer.name": {"$regex": search_term, "$options": "i"}},
                        {"customer.email": {"$regex": search_term, "$options": "i"}},
                        {"customer.username": {"$regex": search_term, "$options": "i"}},
                        {"booking_ref": {"$regex": search_term, "$options": "i"}}
                    ]
                }
            })
        
        # Project fields and extract service info
        pipeline.append({
            "$addFields": {
                "customer_name": {"$ifNull": ["$customer.name", "Unknown"]},
                "customer_email": "$customer.email",
                "customer_phone": "$customer.phone",
                "profile_name": {"$ifNull": ["$profile.name", "Unknown"]},
                # Extract service from profile's services array
                "service_info": {
                    "$filter": {
                        "input": {"$ifNull": ["$profile.services", []]},
                        "as": "svc",
                        "cond": {"$eq": ["$$svc.id", "$service_id"]}
                    }
                }
            }
        })
        
        # Unwind service info
        pipeline.append({
            "$addFields": {
                "service_title": {"$arrayElemAt": ["$service_info.title", 0]},
                "service_price": {"$arrayElemAt": ["$service_info.price", 0]}
            }
        })
        
        # Remove temporary fields and exclude MongoDB _id
        pipeline.append({
            "$project": {
                "_id": 0,
                "customer": 0,
                "profile": 0,
                "service_info": 0
            }
        })
        
        # Get total count before pagination
        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        count_result = mongo_db.aggregate(AdminRepository.BOOKINGS, count_pipeline)
        total = count_result[0]["total"] if count_result else 0
        
        # Sort
        valid_sort_fields = ["created_at", "booking_date", "status", "customer_name"]
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"
        pipeline.append({"$sort": {sort_by: sort_order}})
        
        # Pagination
        skip = (page - 1) * page_size
        pipeline.append({"$skip": skip})
        pipeline.append({"$limit": page_size})
        
        bookings = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        
        return bookings, total
    
    @staticmethod
    def get_booking_with_details(booking_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a single booking with full customer and service details.
        
        Args:
            booking_id: The booking ID
            
        Returns:
            Booking document with enriched details or None
        """
        pipeline = [
            {"$match": {"id": booking_id}},
            # Join with users
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "id",
                    "as": "customer"
                }
            },
            {"$unwind": {"path": "$customer", "preserveNullAndEmptyArrays": True}},
            # Join with profiles
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            # Join with booking notes
            {
                "$lookup": {
                    "from": AdminRepository.BOOKING_NOTES,
                    "localField": "id",
                    "foreignField": "booking_id",
                    "as": "admin_notes_list"
                }
            },
            # Extract service info
            {
                "$addFields": {
                    "customer_name": {"$ifNull": ["$customer.name", "Unknown"]},
                    "customer_email": "$customer.email",
                    "customer_phone": "$customer.phone",
                    "customer_username": "$customer.username",
                    "profile_name": {"$ifNull": ["$profile.name", "Unknown"]},
                    "service_info": {
                        "$filter": {
                            "input": {"$ifNull": ["$profile.services", []]},
                            "as": "svc",
                            "cond": {"$eq": ["$$svc.id", "$service_id"]}
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "service_title": {"$arrayElemAt": ["$service_info.title", 0]},
                    "service_price": {"$arrayElemAt": ["$service_info.price", 0]},
                    "service_description": {"$arrayElemAt": ["$service_info.description", 0]}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "customer": 0,
                    "profile": 0,
                    "service_info": 0
                }
            }
        ]
        
        result = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        return result[0] if result else None
    
    @staticmethod
    def update_booking_status(booking_id: str, status: str) -> int:
        """
        Update booking status to any valid status.
        
        Args:
            booking_id: The booking ID
            status: New status value
            
        Returns:
            Number of modified documents
        """
        return mongo_db.update_one(
            AdminRepository.BOOKINGS,
            {"id": booking_id},
            {"$set": {
                "status": status,
                "updated_at": datetime.utcnow()
            }}
        )
    
    @staticmethod
    def reschedule_booking(
        booking_id: str,
        new_date: datetime,
        new_time_slot: Optional[str] = None
    ) -> int:
        """
        Reschedule a booking to a new date/time.
        
        Args:
            booking_id: The booking ID
            new_date: New booking date
            new_time_slot: Optional new time slot
            
        Returns:
            Number of modified documents
        """
        update_data: Dict[str, Any] = {
            "booking_date": new_date,
            "updated_at": datetime.utcnow()
        }
        
        if new_time_slot is not None:
            update_data["time_slot"] = new_time_slot
        
        return mongo_db.update_one(
            AdminRepository.BOOKINGS,
            {"id": booking_id},
            {"$set": update_data}
        )
    
    @staticmethod
    def add_booking_note(booking_id: str, note: str, user_id: str) -> str:
        """
        Add an admin note to a booking.
        
        Args:
            booking_id: The booking ID
            note: Note text
            user_id: ID of user adding the note
            
        Returns:
            ID of created note
        """
        # Get user info for name
        user = mongo_db.find_one(AdminRepository.USERS, {"id": user_id})
        user_name = user.get("name", "Unknown") if user else "Unknown"
        
        note_id = str(uuid.uuid4())
        note_doc = {
            "id": note_id,
            "booking_id": booking_id,
            "note": note,
            "created_by": user_id,
            "created_by_name": user_name,
            "created_at": datetime.utcnow()
        }
        
        mongo_db.insert_one(AdminRepository.BOOKING_NOTES, note_doc)
        return note_id
    
    @staticmethod
    def get_booking_notes(booking_id: str) -> List[Dict[str, Any]]:
        """Get all notes for a booking."""
        return mongo_db.find_many(
            AdminRepository.BOOKING_NOTES,
            {"booking_id": booking_id},
            sort=[("created_at", -1)]
        )
    
    @staticmethod
    def count_bookings(filters: Dict[str, Any]) -> int:
        """
        Count bookings matching filters.
        
        Args:
            filters: Same filter structure as get_bookings_paginated
            
        Returns:
            Count of matching bookings
        """
        match_query = {}
        
        if filters.get("profile_id"):
            match_query["profile_id"] = filters["profile_id"]
        if filters.get("status"):
            match_query["status"] = filters["status"]
        if filters.get("service_id"):
            match_query["service_id"] = filters["service_id"]
        
        if filters.get("start_date") or filters.get("end_date"):
            date_filter = {}
            if filters.get("start_date"):
                date_filter["$gte"] = filters["start_date"]
            if filters.get("end_date"):
                date_filter["$lte"] = filters["end_date"]
            match_query["booking_date"] = date_filter
        
        # For search, we need aggregation
        if filters.get("search"):
            pipeline = [
                {"$match": match_query},
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "user_id",
                        "foreignField": "id",
                        "as": "customer"
                    }
                },
                {"$unwind": {"path": "$customer", "preserveNullAndEmptyArrays": True}},
                {
                    "$match": {
                        "$or": [
                            {"customer.name": {"$regex": filters["search"], "$options": "i"}},
                            {"customer.email": {"$regex": filters["search"], "$options": "i"}},
                            {"booking_ref": {"$regex": filters["search"], "$options": "i"}}
                        ]
                    }
                },
                {"$count": "total"}
            ]
            result = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
            return result[0]["total"] if result else 0
        
        return mongo_db.count_documents(AdminRepository.BOOKINGS, match_query)
    
    # ===========================
    # CUSTOMERS METHODS
    # ===========================
    
    @staticmethod
    def get_customers_paginated(
        filters: Dict[str, Any],
        page: int = 1,
        page_size: int = 20,
        profile_id: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get paginated customers for an owner.
        
        Shows customers who either:
        - Have owner_id matching the profile's owner (new customers)
        - Have bookings with this profile (legacy customers)
        
        Only shows USER role accounts (excludes OWNER/ADMIN).
        
        Args:
            filters: Dict containing search, is_blocked, min_bookings
            page: Page number (1-indexed)
            page_size: Number of items per page
            profile_id: Filter to customers for this profile
            
        Returns:
            Tuple of (list of customers with stats, total count)
        """
        # Get owner_id from profile
        owner_id = None
        if profile_id:
            profile = mongo_db.find_one("profiles", {"id": profile_id})
            if profile:
                owner_id = profile.get("owner_id")
        
        # Build pipeline starting from users collection
        pipeline = [
            # Match users who are either:
            # 1. Linked to this owner via owner_id, OR
            # 2. Have bookings with this profile (legacy support)
            {
                "$match": {
                    "role": "USER"  # Only show USER role, exclude OWNER/ADMIN
                }
            },
            # Left join with bookings to get users who have booked
            {
                "$lookup": {
                    "from": "bookings",
                    "let": {"user_id": "$id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$user_id", "$$user_id"]},
                                        {"$eq": ["$profile_id", profile_id]} if profile_id else {"$literal": True}
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "bookings"
                }
            },
            # Filter: must have owner_id match OR have bookings with this profile
            {
                "$match": {
                    "$or": [
                        {"owner_id": owner_id} if owner_id else {"owner_id": {"$exists": False}},
                        {"bookings": {"$ne": []}}  # Has bookings with this profile
                    ]
                }
            },
            # Calculate booking stats
            {
                "$addFields": {
                    "total_bookings": {"$size": "$bookings"},
                    "completed_bookings": {
                        "$size": {
                            "$filter": {
                                "input": "$bookings",
                                "as": "b",
                                "cond": {"$eq": ["$$b.status", "COMPLETED"]}
                            }
                        }
                    },
                    "cancelled_bookings": {
                        "$size": {
                            "$filter": {
                                "input": "$bookings",
                                "as": "b",
                                "cond": {"$eq": ["$$b.status", "CANCELLED"]}
                            }
                        }
                    },
                    "no_shows": {
                        "$size": {
                            "$filter": {
                                "input": "$bookings",
                                "as": "b",
                                "cond": {"$eq": ["$$b.status", "NO_SHOW"]}
                            }
                        }
                    },
                    "first_booking": {"$min": "$bookings.created_at"},
                    "last_booking": {"$max": "$bookings.created_at"}
                }
            },
            # Join with blocked_customers
            {
                "$lookup": {
                    "from": AdminRepository.BLOCKED_CUSTOMERS,
                    "let": {"user_id": "$id", "profile_id": profile_id or ""},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$user_id", "$$user_id"]},
                                        {"$eq": ["$profile_id", "$$profile_id"]}
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "block_info"
                }
            },
            # Calculate total spent from completed bookings
            {
                "$lookup": {
                    "from": "profiles",
                    "pipeline": [
                        {"$match": {"id": profile_id} if profile_id else {}},
                        {"$limit": 1}
                    ],
                    "as": "profile_info"
                }
            },
            {
                "$addFields": {
                    "total_spent": {
                        "$reduce": {
                            "input": {
                                "$filter": {
                                    "input": "$bookings",
                                    "as": "b",
                                    "cond": {"$eq": ["$$b.status", "COMPLETED"]}
                                }
                            },
                            "initialValue": 0,
                            "in": {
                                "$add": [
                                    "$$value",
                                    {
                                        "$let": {
                                            "vars": {
                                                "svc": {
                                                    "$filter": {
                                                        "input": {"$ifNull": [{"$arrayElemAt": ["$profile_info.services", 0]}, []]},
                                                        "as": "s",
                                                        "cond": {"$eq": ["$$s.id", "$$this.service_id"]}
                                                    }
                                                }
                                            },
                                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            # Project final shape
            {
                "$project": {
                    "_id": 0,
                    "id": "$id",
                    "user_id": "$id",
                    "username": 1,
                    "name": 1,
                    "email": 1,
                    "phone": 1,
                    "total_bookings": 1,
                    "completed_bookings": 1,
                    "cancelled_bookings": 1,
                    "no_shows": 1,
                    "first_booking": 1,
                    "last_booking": 1,
                    "is_blocked": {"$gt": [{"$size": "$block_info"}, 0]},
                    "blocked_reason": {"$arrayElemAt": ["$block_info.reason", 0]},
                    "total_spent": 1,
                    "created_at": 1
                }
            }
        ]
        
        # Apply search filter
        if filters.get("search"):
            search_term = filters["search"]
            pipeline.append({
                "$match": {
                    "$or": [
                        {"name": {"$regex": search_term, "$options": "i"}},
                        {"email": {"$regex": search_term, "$options": "i"}},
                        {"username": {"$regex": search_term, "$options": "i"}}
                    ]
                }
            })
        
        # Apply blocked filter
        if filters.get("is_blocked") is not None:
            pipeline.append({
                "$match": {"is_blocked": filters["is_blocked"]}
            })
        
        # Apply min_bookings filter
        if filters.get("min_bookings"):
            pipeline.append({
                "$match": {"total_bookings": {"$gte": filters["min_bookings"]}}
            })
        
        # Get total count
        count_pipeline = pipeline.copy()
        count_pipeline.append({"$count": "total"})
        count_result = mongo_db.aggregate(AdminRepository.USERS, count_pipeline)
        total = count_result[0]["total"] if count_result else 0
        
        # Sort and paginate
        pipeline.append({"$sort": {"created_at": -1}})  # Sort by registration date
        skip = (page - 1) * page_size
        pipeline.append({"$skip": skip})
        pipeline.append({"$limit": page_size})
        
        customers = mongo_db.aggregate(AdminRepository.USERS, pipeline)
        
        return customers, total
    
    @staticmethod
    def get_customer_with_stats(user_id: str, profile_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get detailed customer info with booking statistics.
        
        Args:
            user_id: The user ID
            profile_id: Optional profile to scope stats to
            
        Returns:
            Customer document with stats or None
        """
        # Get user info
        user = mongo_db.find_one(AdminRepository.USERS, {"id": user_id})
        if not user:
            return None
        
        # Build match for bookings
        booking_match = {"user_id": user_id}
        if profile_id:
            booking_match["profile_id"] = profile_id
        
        # Aggregate booking stats
        stats_pipeline = [
            {"$match": booking_match},
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_price": {
                        "$let": {
                            "vars": {
                                "svc": {
                                    "$filter": {
                                        "input": {"$ifNull": ["$profile.services", []]},
                                        "as": "s",
                                        "cond": {"$eq": ["$$s.id", "$service_id"]}
                                    }
                                }
                            },
                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_bookings": {"$sum": 1},
                    "completed_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "COMPLETED"]}, 1, 0]}
                    },
                    "cancelled_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "CANCELLED"]}, 1, 0]}
                    },
                    "no_shows": {
                        "$sum": {"$cond": [{"$eq": ["$status", "NO_SHOW"]}, 1, 0]}
                    },
                    "pending_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "PENDING"]}, 1, 0]}
                    },
                    "confirmed_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "CONFIRMED"]}, 1, 0]}
                    },
                    "total_spent": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    },
                    "first_booking": {"$min": "$created_at"},
                    "last_booking": {"$max": "$created_at"}
                }
            }
        ]
        
        stats_result = mongo_db.aggregate(AdminRepository.BOOKINGS, stats_pipeline)
        stats = stats_result[0] if stats_result else {}
        
        # Check if blocked
        block_query = {"user_id": user_id}
        if profile_id:
            block_query["profile_id"] = profile_id
        block_info = mongo_db.find_one(AdminRepository.BLOCKED_CUSTOMERS, block_query)
        
        return {
            "id": user["id"],
            "username": user.get("username"),
            "name": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("phone"),
            "role": user.get("role"),
            "total_bookings": stats.get("total_bookings", 0),
            "completed_bookings": stats.get("completed_bookings", 0),
            "cancelled_bookings": stats.get("cancelled_bookings", 0),
            "no_shows": stats.get("no_shows", 0),
            "pending_bookings": stats.get("pending_bookings", 0),
            "confirmed_bookings": stats.get("confirmed_bookings", 0),
            "total_spent": stats.get("total_spent", 0),
            "first_booking": stats.get("first_booking"),
            "last_booking": stats.get("last_booking"),
            "is_blocked": block_info is not None,
            "blocked_reason": block_info.get("reason") if block_info else None,
            "blocked_at": block_info.get("created_at") if block_info else None,
            "created_at": user.get("created_at")
        }
    
    @staticmethod
    def get_customer_bookings(
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        profile_id: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get paginated bookings for a specific customer.
        
        Args:
            user_id: The user ID
            page: Page number
            page_size: Items per page
            profile_id: Optional profile filter
            
        Returns:
            Tuple of (bookings list, total count)
        """
        match_query = {"user_id": user_id}
        if profile_id:
            match_query["profile_id"] = profile_id
        
        total = mongo_db.count_documents(AdminRepository.BOOKINGS, match_query)
        
        pipeline = [
            {"$match": match_query},
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "profile_name": {"$ifNull": ["$profile.name", "Unknown"]},
                    "service_info": {
                        "$filter": {
                            "input": {"$ifNull": ["$profile.services", []]},
                            "as": "svc",
                            "cond": {"$eq": ["$$svc.id", "$service_id"]}
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "service_title": {"$arrayElemAt": ["$service_info.title", 0]},
                    "service_price": {"$arrayElemAt": ["$service_info.price", 0]}
                }
            },
            {"$project": {"_id": 0, "profile": 0, "service_info": 0}},
            {"$sort": {"booking_date": -1}},
            {"$skip": (page - 1) * page_size},
            {"$limit": page_size}
        ]
        
        bookings = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        
        return bookings, total
    
    @staticmethod
    def block_customer(
        user_id: str,
        profile_id: str,
        blocked_by: str,
        reason: Optional[str] = None
    ) -> str:
        """
        Block a customer from booking with a profile.
        
        Args:
            user_id: The user to block
            profile_id: The profile blocking them
            blocked_by: Admin user who is blocking
            reason: Optional reason for blocking
            
        Returns:
            ID of the block record
        """
        # Check if already blocked
        existing = mongo_db.find_one(
            AdminRepository.BLOCKED_CUSTOMERS,
            {"user_id": user_id, "profile_id": profile_id}
        )
        
        if existing:
            # Update reason
            mongo_db.update_one(
                AdminRepository.BLOCKED_CUSTOMERS,
                {"id": existing["id"]},
                {"$set": {"reason": reason, "blocked_by": blocked_by, "updated_at": datetime.utcnow()}}
            )
            return existing["id"]
        
        block_id = str(uuid.uuid4())
        block_doc = {
            "id": block_id,
            "user_id": user_id,
            "profile_id": profile_id,
            "blocked_by": blocked_by,
            "reason": reason,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        mongo_db.insert_one(AdminRepository.BLOCKED_CUSTOMERS, block_doc)
        return block_id
    
    @staticmethod
    def unblock_customer(user_id: str, profile_id: str) -> int:
        """
        Unblock a customer.
        
        Args:
            user_id: The user to unblock
            profile_id: The profile unblocking them
            
        Returns:
            Number of deleted records
        """
        return mongo_db.delete_one(
            AdminRepository.BLOCKED_CUSTOMERS,
            {"user_id": user_id, "profile_id": profile_id}
        )
    
    @staticmethod
    def is_customer_blocked(user_id: str, profile_id: str) -> bool:
        """
        Check if a customer is blocked for a profile.
        
        Args:
            user_id: The user ID
            profile_id: The profile ID
            
        Returns:
            True if blocked, False otherwise
        """
        result = mongo_db.find_one(
            AdminRepository.BLOCKED_CUSTOMERS,
            {"user_id": user_id, "profile_id": profile_id}
        )
        return result is not None
    
    @staticmethod
    def add_customer_note(
        customer_id: str,
        note: str,
        created_by: str,
        profile_id: Optional[str] = None
    ) -> str:
        """
        Add a note to a customer.
        
        Args:
            customer_id: The customer's user ID
            note: Note text
            created_by: Admin user ID creating the note
            profile_id: Optional profile context
            
        Returns:
            ID of created note
        """
        # Get creator name
        user = mongo_db.find_one(AdminRepository.USERS, {"id": created_by})
        user_name = user.get("name", "Unknown") if user else "Unknown"
        
        note_id = str(uuid.uuid4())
        note_doc = {
            "id": note_id,
            "customer_id": customer_id,
            "profile_id": profile_id,
            "note": note,
            "created_by": created_by,
            "created_by_name": user_name,
            "created_at": datetime.utcnow()
        }
        
        mongo_db.insert_one(AdminRepository.CUSTOMER_NOTES, note_doc)
        return note_id
    
    @staticmethod
    def get_customer_notes(
        customer_id: str,
        profile_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get all notes for a customer.
        
        Args:
            customer_id: The customer's user ID
            profile_id: Optional profile filter
            
        Returns:
            List of notes
        """
        query = {"customer_id": customer_id}
        if profile_id:
            query["profile_id"] = profile_id
        
        return mongo_db.find_many(
            AdminRepository.CUSTOMER_NOTES,
            query,
            sort=[("created_at", -1)]
        )
    
    # ===========================
    # ANALYTICS METHODS
    # ===========================
    
    @staticmethod
    def get_dashboard_stats(profile_id: str) -> Dict[str, Any]:
        """
        Get comprehensive dashboard statistics for a profile.
        
        Args:
            profile_id: The profile ID
            
        Returns:
            Dictionary with various statistics
        """
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=today_start.weekday())
        month_start = today_start.replace(day=1)
        
        # Main stats aggregation
        stats_pipeline = [
            {"$match": {"profile_id": profile_id}},
            # Join with profiles for service prices
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_price": {
                        "$let": {
                            "vars": {
                                "svc": {
                                    "$filter": {
                                        "input": {"$ifNull": ["$profile.services", []]},
                                        "as": "s",
                                        "cond": {"$eq": ["$$s.id", "$service_id"]}
                                    }
                                }
                            },
                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                        }
                    },
                    "is_today": {"$gte": ["$booking_date", today_start]},
                    "is_this_week": {"$gte": ["$booking_date", week_start]},
                    "is_this_month": {"$gte": ["$booking_date", month_start]}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_bookings": {"$sum": 1},
                    "pending_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "PENDING"]}, 1, 0]}
                    },
                    "confirmed_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "CONFIRMED"]}, 1, 0]}
                    },
                    "completed_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "COMPLETED"]}, 1, 0]}
                    },
                    "no_show_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "NO_SHOW"]}, 1, 0]}
                    },
                    "today_bookings": {
                        "$sum": {"$cond": ["$is_today", 1, 0]}
                    },
                    "this_week_bookings": {
                        "$sum": {"$cond": ["$is_this_week", 1, 0]}
                    },
                    "this_month_bookings": {
                        "$sum": {"$cond": ["$is_this_month", 1, 0]}
                    },
                    "total_revenue": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    },
                    "this_week_revenue": {
                        "$sum": {
                            "$cond": [
                                {"$and": [
                                    {"$eq": ["$status", "COMPLETED"]},
                                    "$is_this_week"
                                ]},
                                "$service_price",
                                0
                            ]
                        }
                    },
                    "this_month_revenue": {
                        "$sum": {
                            "$cond": [
                                {"$and": [
                                    {"$eq": ["$status", "COMPLETED"]},
                                    "$is_this_month"
                                ]},
                                "$service_price",
                                0
                            ]
                        }
                    },
                    "unique_customers": {"$addToSet": "$user_id"}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "total_bookings": 1,
                    "pending_bookings": 1,
                    "confirmed_bookings": 1,
                    "completed_bookings": 1,
                    "no_show_bookings": 1,
                    "today_bookings": 1,
                    "this_week_bookings": 1,
                    "this_month_bookings": 1,
                    "total_revenue": 1,
                    "this_week_revenue": 1,
                    "this_month_revenue": 1,
                    "total_customers": {"$size": "$unique_customers"}
                }
            }
        ]
        
        stats_result = mongo_db.aggregate(AdminRepository.BOOKINGS, stats_pipeline)
        stats = stats_result[0] if stats_result else {}
        
        # Calculate rates
        total = stats.get("total_bookings", 0)
        completed = stats.get("completed_bookings", 0)
        no_shows = stats.get("no_show_bookings", 0)
        
        completion_rate = (completed / total * 100) if total > 0 else 0
        no_show_rate = (no_shows / total * 100) if total > 0 else 0
        
        # Get new customers this week
        new_customers_pipeline = [
            {"$match": {"profile_id": profile_id}},
            {
                "$group": {
                    "_id": "$user_id",
                    "first_booking": {"$min": "$created_at"}
                }
            },
            {
                "$match": {
                    "first_booking": {"$gte": week_start}
                }
            },
            {"$count": "count"}
        ]
        
        new_customers_result = mongo_db.aggregate(AdminRepository.BOOKINGS, new_customers_pipeline)
        new_customers = new_customers_result[0]["count"] if new_customers_result else 0
        
        return {
            "total_bookings": stats.get("total_bookings", 0),
            "pending_bookings": stats.get("pending_bookings", 0),
            "confirmed_bookings": stats.get("confirmed_bookings", 0),
            "today_bookings": stats.get("today_bookings", 0),
            "this_week_bookings": stats.get("this_week_bookings", 0),
            "this_month_bookings": stats.get("this_month_bookings", 0),
            "total_revenue": round(stats.get("total_revenue", 0), 2),
            "this_week_revenue": round(stats.get("this_week_revenue", 0), 2),
            "this_month_revenue": round(stats.get("this_month_revenue", 0), 2),
            "total_customers": stats.get("total_customers", 0),
            "new_customers_this_week": new_customers,
            "completion_rate": round(completion_rate, 1),
            "no_show_rate": round(no_show_rate, 1)
        }
    
    @staticmethod
    def get_booking_trends(profile_id: str, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get daily booking counts and revenue for the past N days.
        
        Args:
            profile_id: The profile ID
            days: Number of days to look back
            
        Returns:
            List of {date, count, revenue} objects
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        
        pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "created_at": {"$gte": start_date}
                }
            },
            # Join for service prices
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_price": {
                        "$let": {
                            "vars": {
                                "svc": {
                                    "$filter": {
                                        "input": {"$ifNull": ["$profile.services", []]},
                                        "as": "s",
                                        "cond": {"$eq": ["$$s.id", "$service_id"]}
                                    }
                                }
                            },
                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$booking_date"
                        }
                    },
                    "count": {"$sum": 1},
                    "revenue": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    }
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "date": "$_id",
                    "count": 1,
                    "revenue": {"$round": ["$revenue", 2]}
                }
            }
        ]
        
        return mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
    
    @staticmethod
    def get_revenue_by_period(
        profile_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Get revenue statistics for a date range.
        
        Args:
            profile_id: The profile ID
            start_date: Start of period
            end_date: End of period
            
        Returns:
            Revenue statistics
        """
        pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "booking_date": {"$gte": start_date, "$lte": end_date},
                    "status": "COMPLETED"
                }
            },
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_price": {
                        "$let": {
                            "vars": {
                                "svc": {
                                    "$filter": {
                                        "input": {"$ifNull": ["$profile.services", []]},
                                        "as": "s",
                                        "cond": {"$eq": ["$$s.id", "$service_id"]}
                                    }
                                }
                            },
                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_revenue": {"$sum": "$service_price"},
                    "booking_count": {"$sum": 1},
                    "avg_booking_value": {"$avg": "$service_price"}
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "total_revenue": {"$round": ["$total_revenue", 2]},
                    "booking_count": 1,
                    "avg_booking_value": {"$round": ["$avg_booking_value", 2]}
                }
            }
        ]
        
        result = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        return result[0] if result else {
            "total_revenue": 0,
            "booking_count": 0,
            "avg_booking_value": 0
        }
    
    @staticmethod
    def get_popular_services(profile_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Get most popular services by booking count.
        
        Args:
            profile_id: The profile ID
            limit: Maximum number of services to return
            
        Returns:
            List of service statistics
        """
        pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "service_id": {"$ne": None}
                }
            },
            # Join with profiles for service details
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_info": {
                        "$filter": {
                            "input": {"$ifNull": ["$profile.services", []]},
                            "as": "s",
                            "cond": {"$eq": ["$$s.id", "$service_id"]}
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "service_title": {"$arrayElemAt": ["$service_info.title", 0]},
                    "service_price": {"$arrayElemAt": ["$service_info.price", 0]}
                }
            },
            {
                "$group": {
                    "_id": "$service_id",
                    "service_title": {"$first": "$service_title"},
                    "booking_count": {"$sum": 1},
                    "revenue": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    }
                }
            },
            {"$sort": {"booking_count": -1}},
            {"$limit": limit}
        ]
        
        results = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        
        # Calculate total for percentages
        total_bookings = sum(r.get("booking_count", 0) for r in results)
        
        return [
            {
                "service_id": r["_id"],
                "service_title": r.get("service_title", "Unknown"),
                "booking_count": r.get("booking_count", 0),
                "revenue": round(r.get("revenue", 0), 2),
                "percentage": round(
                    (r.get("booking_count", 0) / total_bookings * 100) if total_bookings > 0 else 0,
                    1
                )
            }
            for r in results
        ]
    
    @staticmethod
    def get_peak_hours(profile_id: str) -> List[Dict[str, Any]]:
        """
        Get busiest hours by booking count.
        
        Args:
            profile_id: The profile ID
            
        Returns:
            List of {hour, count} for each hour with bookings
        """
        pipeline = [
            {"$match": {"profile_id": profile_id}},
            {
                "$group": {
                    "_id": {"$hour": "$booking_date"},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}},
            {
                "$project": {
                    "_id": 0,
                    "hour": "$_id",
                    "count": 1
                }
            }
        ]
        
        return mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
    
    # ===========================
    # NEW ANALYTICS METHODS (Date Range Support)
    # ===========================
    
    @staticmethod
    def get_analytics_overview(
        profile_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Get comprehensive analytics overview for a date range.
        
        Calculates:
        - Total bookings and revenue
        - Average booking value
        - Completion rate and cancellation rate
        - Popular services
        - Booking trends
        
        Args:
            profile_id: The profile ID
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            Dictionary with overview analytics
        """
        # Main stats aggregation for the period
        stats_pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "booking_date": {"$gte": start_date, "$lte": end_date}
                }
            },
            # Join with profiles for service prices
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_price": {
                        "$let": {
                            "vars": {
                                "svc": {
                                    "$filter": {
                                        "input": {"$ifNull": ["$profile.services", []]},
                                        "as": "s",
                                        "cond": {"$eq": ["$$s.id", "$service_id"]}
                                    }
                                }
                            },
                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_bookings": {"$sum": 1},
                    "completed_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "COMPLETED"]}, 1, 0]}
                    },
                    "cancelled_bookings": {
                        "$sum": {"$cond": [{"$eq": ["$status", "CANCELLED"]}, 1, 0]}
                    },
                    "total_revenue": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    },
                    "completed_revenue_sum": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    },
                    "completed_count": {
                        "$sum": {"$cond": [{"$eq": ["$status", "COMPLETED"]}, 1, 0]}
                    }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "total_bookings": 1,
                    "completed_bookings": 1,
                    "cancelled_bookings": 1,
                    "total_revenue": {"$round": ["$total_revenue", 2]},
                    "average_booking_value": {
                        "$round": [
                            {
                                "$cond": [
                                    {"$gt": ["$completed_count", 0]},
                                    {"$divide": ["$completed_revenue_sum", "$completed_count"]},
                                    0
                                ]
                            },
                            2
                        ]
                    }
                }
            }
        ]
        
        stats_result = mongo_db.aggregate(AdminRepository.BOOKINGS, stats_pipeline)
        stats = stats_result[0] if stats_result else {
            "total_bookings": 0,
            "completed_bookings": 0,
            "cancelled_bookings": 0,
            "total_revenue": 0,
            "average_booking_value": 0
        }
        
        # Calculate rates
        total = stats.get("total_bookings", 0)
        completed = stats.get("completed_bookings", 0)
        cancelled = stats.get("cancelled_bookings", 0)
        
        completion_rate = round((completed / total * 100), 1) if total > 0 else 0
        cancellation_rate = round((cancelled / total * 100), 1) if total > 0 else 0
        
        # Get popular services for the period
        popular_services = AdminRepository.get_popular_services_by_range(
            profile_id, start_date, end_date
        )
        
        # Get booking trends for the period
        booking_trends = AdminRepository.get_booking_trends_by_range(
            profile_id, start_date, end_date, "day"
        )
        
        # Format period string
        period = f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
        
        return {
            "period": period,
            "total_bookings": stats.get("total_bookings", 0),
            "total_revenue": stats.get("total_revenue", 0),
            "average_booking_value": stats.get("average_booking_value", 0),
            "booking_completion_rate": completion_rate,
            "cancellation_rate": cancellation_rate,
            "popular_services": popular_services,
            "booking_trends": booking_trends
        }
    
    @staticmethod
    def get_booking_trends_by_range(
        profile_id: str,
        start_date: datetime,
        end_date: datetime,
        granularity: str = "day"
    ) -> List[Dict[str, Any]]:
        """
        Get booking trends for a date range with configurable granularity.
        
        Args:
            profile_id: The profile ID
            start_date: Start of date range
            end_date: End of date range
            granularity: "day", "week", or "month"
            
        Returns:
            List of {date, count, revenue} objects
        """
        # Determine date grouping based on granularity
        if granularity == "week":
            date_format = "%Y-W%V"  # ISO week
            date_expr = {
                "$dateToString": {
                    "format": "%Y-W%V",
                    "date": "$booking_date"
                }
            }
        elif granularity == "month":
            date_format = "%Y-%m"
            date_expr = {
                "$dateToString": {
                    "format": "%Y-%m",
                    "date": "$booking_date"
                }
            }
        else:  # day (default)
            date_format = "%Y-%m-%d"
            date_expr = {
                "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$booking_date"
                }
            }
        
        pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "booking_date": {"$gte": start_date, "$lte": end_date}
                }
            },
            # Join for service prices
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_price": {
                        "$let": {
                            "vars": {
                                "svc": {
                                    "$filter": {
                                        "input": {"$ifNull": ["$profile.services", []]},
                                        "as": "s",
                                        "cond": {"$eq": ["$$s.id", "$service_id"]}
                                    }
                                }
                            },
                            "in": {"$ifNull": [{"$arrayElemAt": ["$$svc.price", 0]}, 0]}
                        }
                    }
                }
            },
            {
                "$group": {
                    "_id": date_expr,
                    "count": {"$sum": 1},
                    "revenue": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    }
                }
            },
            {"$sort": {"_id": 1}},
            {
                "$project": {
                    "_id": 0,
                    "date": "$_id",
                    "count": 1,
                    "revenue": {"$round": ["$revenue", 2]}
                }
            }
        ]
        
        return mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
    
    @staticmethod
    def get_peak_hours_by_range(
        profile_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """
        Get peak booking hours for a date range.
        
        Returns hours in string format (e.g., "09:00") with booking counts
        and percentages for frontend compatibility.
        
        Args:
            profile_id: The profile ID
            start_date: Start of date range
            end_date: End of date range
            
        Returns:
            List of {hour, booking_count, percentage} objects
        """
        pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "booking_date": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {"$hour": "$booking_date"},
                    "booking_count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}  # Sort by hour
        ]
        
        results = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        
        # Calculate total for percentages
        total_bookings = sum(r.get("booking_count", 0) for r in results)
        
        # Format results with string hours and percentages
        formatted_results = []
        for r in results:
            hour_int = r["_id"]
            hour_str = f"{hour_int:02d}:00"  # Convert 9 -> "09:00"
            booking_count = r.get("booking_count", 0)
            percentage = round((booking_count / total_bookings * 100), 1) if total_bookings > 0 else 0
            
            formatted_results.append({
                "hour": hour_str,
                "booking_count": booking_count,
                "percentage": percentage
            })
        
        # Sort by booking count descending
        formatted_results.sort(key=lambda x: x["booking_count"], reverse=True)
        
        return formatted_results
    
    @staticmethod
    def get_popular_services_by_range(
        profile_id: str,
        start_date: datetime,
        end_date: datetime,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get most popular services for a date range.
        
        Args:
            profile_id: The profile ID
            start_date: Start of date range
            end_date: End of date range
            limit: Maximum number of services to return
            
        Returns:
            List of service statistics
        """
        pipeline = [
            {
                "$match": {
                    "profile_id": profile_id,
                    "booking_date": {"$gte": start_date, "$lte": end_date},
                    "service_id": {"$ne": None}
                }
            },
            # Join with profiles for service details
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "profile_id",
                    "foreignField": "id",
                    "as": "profile"
                }
            },
            {"$unwind": {"path": "$profile", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "service_info": {
                        "$filter": {
                            "input": {"$ifNull": ["$profile.services", []]},
                            "as": "s",
                            "cond": {"$eq": ["$$s.id", "$service_id"]}
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "service_title": {"$arrayElemAt": ["$service_info.title", 0]},
                    "service_price": {"$arrayElemAt": ["$service_info.price", 0]}
                }
            },
            {
                "$group": {
                    "_id": "$service_id",
                    "service_title": {"$first": "$service_title"},
                    "booking_count": {"$sum": 1},
                    "revenue": {
                        "$sum": {
                            "$cond": [{"$eq": ["$status", "COMPLETED"]}, "$service_price", 0]
                        }
                    }
                }
            },
            {"$sort": {"booking_count": -1}},
            {"$limit": limit}
        ]
        
        results = mongo_db.aggregate(AdminRepository.BOOKINGS, pipeline)
        
        # Calculate total for percentages
        total_bookings = sum(r.get("booking_count", 0) for r in results)
        
        return [
            {
                "service_id": r["_id"],
                "service_title": r.get("service_title", "Unknown"),
                "service_name": r.get("service_title", "Unknown"),  # Frontend alias
                "booking_count": r.get("booking_count", 0),
                "total_bookings": r.get("booking_count", 0),  # Frontend alias
                "revenue": round(r.get("revenue", 0), 2),
                "percentage": round(
                    (r.get("booking_count", 0) / total_bookings * 100) if total_bookings > 0 else 0,
                    1
                )
            }
            for r in results
        ]
    
    # ===========================
    # ACTIVITY LOGGING METHODS
    # ===========================
    
    @staticmethod
    def log_activity(
        user_id: str,
        action: str,
        entity_type: str,
        entity_id: str,
        details: Optional[Dict[str, Any]] = None,
        profile_id: Optional[str] = None
    ) -> str:
        """
        Log an admin activity.
        
        Args:
            user_id: The user performing the action
            action: Action type (e.g., 'booking_confirmed', 'customer_blocked')
            entity_type: Type of entity (booking, customer, service)
            entity_id: ID of the entity
            details: Optional additional details
            profile_id: Profile context for the activity
            
        Returns:
            ID of created activity log
        """
        # Get user name
        user = mongo_db.find_one(AdminRepository.USERS, {"id": user_id})
        user_name = user.get("name", "Unknown") if user else "Unknown"
        
        activity_id = str(uuid.uuid4())
        activity_doc = {
            "id": activity_id,
            "user_id": user_id,
            "user_name": user_name,
            "profile_id": profile_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details,
            "created_at": datetime.utcnow()
        }
        
        mongo_db.insert_one(AdminRepository.ACTIVITIES, activity_doc)
        return activity_id
    
    @staticmethod
    def get_recent_activities(
        profile_id: str,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get recent activity logs for a profile.
        
        Args:
            profile_id: The profile ID
            limit: Maximum number of activities to return
            
        Returns:
            List of activity logs
        """
        return mongo_db.find_many(
            AdminRepository.ACTIVITIES,
            {"profile_id": profile_id},
            sort=[("created_at", -1)],
            limit=limit
        )
    
    @staticmethod
    def get_activities_paginated(
        profile_id: str,
        page: int = 1,
        page_size: int = 50,
        action_filter: Optional[str] = None,
        entity_type_filter: Optional[str] = None
    ) -> Tuple[List[Dict[str, Any]], int]:
        """
        Get paginated activity logs with optional filters.
        
        Args:
            profile_id: The profile ID
            page: Page number
            page_size: Items per page
            action_filter: Optional filter by action type
            entity_type_filter: Optional filter by entity type
            
        Returns:
            Tuple of (activities list, total count)
        """
        query = {"profile_id": profile_id}
        
        if action_filter:
            query["action"] = action_filter
        if entity_type_filter:
            query["entity_type"] = entity_type_filter
        
        total = mongo_db.count_documents(AdminRepository.ACTIVITIES, query)
        
        skip = (page - 1) * page_size
        activities = mongo_db.find_many(
            AdminRepository.ACTIVITIES,
            query,
            sort=[("created_at", -1)],
            skip=skip,
            limit=page_size
        )
        
        return activities, total
