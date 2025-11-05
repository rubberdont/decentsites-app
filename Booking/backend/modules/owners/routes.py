from fastapi import APIRouter, HTTPException, status, Depends
from typing import List

from modules.auth.security import get_current_user
from modules.auth.models import UserCredentials
from modules.profiles.models import BusinessProfile
from modules.profiles.repository import ProfileRepository
from .models import DashboardStats, ProfileAnalytics, ProfileWithBookingCount
from .repository import OwnersRepository


router = APIRouter(prefix="/owners", tags=["owners"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Get owner dashboard statistics.
    
    Args:
        current_user: Authenticated owner user
        
    Returns:
        DashboardStats with booking and revenue information
    """
    stats = OwnersRepository.get_dashboard_stats(current_user.user_id)
    return stats


@router.get("/my-profiles", response_model=List[ProfileWithBookingCount])
async def list_my_profiles(
    current_user: UserCredentials = Depends(get_current_user),
    skip: int = 0,
    limit: int = 10,
):
    """
    Get all profiles owned by current user with booking counts.
    
    Args:
        current_user: Authenticated owner user
        skip: Number of profiles to skip
        limit: Maximum profiles to return
        
    Returns:
        List of profiles with booking counts
    """
    profiles = OwnersRepository.get_user_profiles(current_user.user_id, skip, limit)
    return [ProfileWithBookingCount(**p) for p in profiles]


@router.post("/profiles", response_model=BusinessProfile)
async def create_profile(
    profile_data: BusinessProfile,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Create a new profile with auto-assigned owner.
    
    Args:
        profile_data: Profile creation data
        current_user: Authenticated owner user
        
    Returns:
        Created BusinessProfile
    """
    # Auto-assign owner_id to current user
    profile_data.owner_id = current_user.user_id
    
    created_profile = ProfileRepository.create_profile(profile_data)
    return BusinessProfile(**created_profile)


@router.get("/profiles/{profile_id}/analytics", response_model=ProfileAnalytics)
async def get_profile_analytics(
    profile_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Get analytics for a specific profile.
    
    Args:
        profile_id: Profile ID
        current_user: Authenticated owner user
        
    Returns:
        ProfileAnalytics with booking trends and popular services
        
    Raises:
        HTTPException: If profile not found or user is not the owner
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Only owner can view analytics
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this profile's analytics"
        )
    
    analytics = OwnersRepository.get_profile_analytics(profile_id)
    return analytics
