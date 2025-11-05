from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from core.mongo_helper import mongo_db
from .models import DashboardStats, ProfileAnalytics, ServiceStats, DateCount


class OwnersRepository:
    """Repository for owner dashboard operations."""
    
    @staticmethod
    def get_dashboard_stats(user_id: str) -> DashboardStats:
        """
        Get dashboard statistics for owner.
        
        Args:
            user_id: Owner user ID
            
        Returns:
            DashboardStats with aggregated booking information
        """
        db = mongo_db.get_database()
        
        # Get all profiles owned by user
        profiles = db.profiles.find({"owner_id": user_id})
        profile_ids = [p["id"] for p in profiles]
        
        if not profile_ids:
            return DashboardStats(
                total_bookings=0,
                pending_bookings=0,
                confirmed_bookings=0,
                today_bookings=0,
                this_week_bookings=0,
                total_revenue=0.0
            )
        
        # Get booking stats
        bookings = list(db.bookings.find({"profile_id": {"$in": profile_ids}}))
        
        # Calculate statistics
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        week_start = today_start - timedelta(days=now.weekday())
        
        total_bookings = len(bookings)
        pending_bookings = len([b for b in bookings if b.get("status") == "PENDING"])
        confirmed_bookings = len([b for b in bookings if b.get("status") == "CONFIRMED"])
        today_bookings = len([b for b in bookings if today_start <= b.get("booking_date", datetime.utcnow()) < today_end])
        this_week_bookings = len([b for b in bookings if week_start <= b.get("booking_date", datetime.utcnow())])
        
        # Calculate revenue from confirmed bookings
        total_revenue = 0.0
        for booking in bookings:
            if booking.get("status") == "CONFIRMED":
                profile = db.profiles.find_one({"id": booking["profile_id"]})
                if profile and booking.get("service_id"):
                    services = profile.get("services", [])
                    service = next((s for s in services if s["id"] == booking["service_id"]), None)
                    if service:
                        total_revenue += float(service.get("price", 0))
        
        return DashboardStats(
            total_bookings=total_bookings,
            pending_bookings=pending_bookings,
            confirmed_bookings=confirmed_bookings,
            today_bookings=today_bookings,
            this_week_bookings=this_week_bookings,
            total_revenue=total_revenue
        )
    
    @staticmethod
    def get_user_profiles(user_id: str, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get profiles owned by user with booking counts.
        
        Args:
            user_id: Owner user ID
            skip: Number of profiles to skip
            limit: Maximum profiles to return
            
        Returns:
            List of profiles with booking counts
        """
        db = mongo_db.get_database()
        
        profiles = list(db.profiles.find({"owner_id": user_id}).skip(skip).limit(limit))
        
        for profile in profiles:
            profile_id = profile["id"]
            bookings = list(db.bookings.find({"profile_id": profile_id}))
            profile["total_bookings"] = len(bookings)
            profile["pending_bookings"] = len([b for b in bookings if b.get("status") == "PENDING"])
            profile["confirmed_bookings"] = len([b for b in bookings if b.get("status") == "CONFIRMED"])
        
        return profiles
    
    @staticmethod
    def get_profile_analytics(profile_id: str) -> ProfileAnalytics:
        """
        Get detailed analytics for a specific profile.
        
        Args:
            profile_id: Profile ID
            
        Returns:
            ProfileAnalytics with booking trends and popular services
        """
        db = mongo_db.get_database()
        
        profile = db.profiles.find_one({"id": profile_id})
        if not profile:
            raise ValueError("Profile not found")
        
        # Get all bookings for profile
        bookings = list(db.bookings.find({"profile_id": profile_id}))
        
        # Calculate basic stats
        total_bookings = len(bookings)
        confirmed_bookings = len([b for b in bookings if b.get("status") == "CONFIRMED"])
        cancelled_bookings = len([b for b in bookings if b.get("status") == "CANCELLED"])
        
        # Calculate popular services
        service_stats_dict: Dict[str, Dict[str, Any]] = {}
        for booking in bookings:
            service_id = booking.get("service_id")
            if service_id:
                if service_id not in service_stats_dict:
                    service = next((s for s in profile.get("services", []) if s["id"] == service_id), None)
                    if service:
                        service_stats_dict[service_id] = {
                            "service_id": service_id,
                            "service_title": service.get("title", ""),
                            "total_bookings": 0,
                            "revenue": 0.0
                        }
                
                if service_id in service_stats_dict:
                    service_stats_dict[service_id]["total_bookings"] += 1
                    if booking.get("status") == "CONFIRMED":
                        service_stats_dict[service_id]["revenue"] += float(profile.get("services", [{}])[0].get("price", 0))
        
        popular_services = [ServiceStats(**s) for s in service_stats_dict.values()]
        popular_services.sort(key=lambda x: x.total_bookings, reverse=True)
        
        # Calculate booking trend (last 30 days)
        now = datetime.utcnow()
        booking_trend_dict: Dict[str, int] = {}
        
        for booking in bookings:
            booking_date = booking.get("booking_date", now)
            date_str = booking_date.strftime("%Y-%m-%d")
            if date_str not in booking_trend_dict:
                booking_trend_dict[date_str] = 0
            booking_trend_dict[date_str] += 1
        
        booking_trend = [DateCount(date=date, count=count) for date, count in sorted(booking_trend_dict.items())]
        
        return ProfileAnalytics(
            profile_id=profile_id,
            profile_name=profile.get("name", ""),
            total_bookings=total_bookings,
            confirmed_bookings=confirmed_bookings,
            cancelled_bookings=cancelled_bookings,
            popular_services=popular_services,
            booking_trend=booking_trend
        )
