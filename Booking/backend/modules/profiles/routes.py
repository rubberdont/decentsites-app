from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
import uuid

from .models import BusinessProfile, Service, ServiceCreate, ServiceUpdate
from .repository import ProfileRepository
from modules.auth.security import get_current_user
from modules.auth.models import UserCredentials

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("", response_model=List[BusinessProfile])
async def list_profiles():
    """Get all business profiles."""
    profiles = ProfileRepository.get_all_profiles()
    return profiles


@router.get("/default", response_model=BusinessProfile)
async def get_default_profile():
    """
    Get the default business profile based on DEFAULT_OWNER_ID from environment.
    This is used by customers to see available services.
    """
    import os
    
    default_owner_id = os.getenv("DEFAULT_OWNER_ID")
    if not default_owner_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Default owner not configured. Please contact support."
        )
    
    # Get all profiles for the default owner
    profiles = ProfileRepository.get_profiles_by_owner(default_owner_id)
    
    if not profiles or len(profiles) == 0:
        raise HTTPException(
            status_code=404,
            detail="No business profile found. Please contact support."
        )
    
    # Return the first active profile, or just the first one if none are active
    active_profile = next((p for p in profiles if p.get("is_active", True)), None)
    if active_profile:
        return active_profile
    
    return profiles[0]


@router.get("/slug/{slug}", response_model=BusinessProfile)
async def get_profile_by_slug(slug: str):
    """Get a specific business profile by slug."""
    profile = ProfileRepository.get_profile_by_slug(slug)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.get("/{profile_id}", response_model=BusinessProfile)
async def get_profile(profile_id: str):
    """Get a specific business profile by ID or slug."""
    # Try to get by slug first, then by ID
    profile = ProfileRepository.get_profile_by_slug(profile_id)
    if not profile:
        profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("", response_model=BusinessProfile)
async def create_profile(profile: BusinessProfile):
    """Create a new business profile."""
    if not profile.id:
        profile.id = str(uuid.uuid4())
    
    # Validate slug uniqueness if provided
    if profile.slug and ProfileRepository.slug_exists(profile.slug):
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    created = ProfileRepository.create_profile(profile)
    return created


@router.put("/{profile_id}", response_model=BusinessProfile)
async def update_profile(profile_id: str, profile: BusinessProfile):
    """Update an existing business profile."""
    existing = ProfileRepository.get_profile(profile_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Validate slug uniqueness if provided and changed
    if profile.slug and profile.slug != existing.get("slug") and ProfileRepository.slug_exists(profile.slug, profile_id):
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    profile.id = profile_id
    updates = profile.model_dump()
    ProfileRepository.update_profile(profile_id, updates)
    return profile


@router.delete("/{profile_id}")
async def delete_profile(profile_id: str):
    """Delete a business profile."""
    existing = ProfileRepository.get_profile(profile_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    ProfileRepository.delete_profile(profile_id)
    return {"message": "Profile deleted successfully"}


@router.get("/{profile_id}/services", response_model=List[Service])
async def get_profile_services(profile_id: str):
    """Get all services for a profile."""
    profile = ProfileRepository.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile.get("services", [])


@router.post("/{profile_id}/services", response_model=Service)
async def create_service(profile_id: str, service: ServiceCreate):
    """Add a service to a profile."""
    profile = ProfileRepository.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Create Service with auto-generated ID
    new_service = Service(
        id=str(uuid.uuid4()),
        **service.model_dump()
    )
    
    ProfileRepository.add_service_to_profile(profile_id, new_service)
    return new_service


@router.put("/{profile_id}/services/{service_id}", response_model=Service)
async def update_service(profile_id: str, service_id: str, service_data: ServiceUpdate):
    """Update a service in a profile."""
    profile = ProfileRepository.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Find existing service
    existing_service = next(
        (s for s in profile.get("services", []) if s["id"] == service_id),
        None
    )
    if existing_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Only update fields that were provided (not None)
    updates = {k: v for k, v in service_data.model_dump().items() if v is not None}
    ProfileRepository.update_service_in_profile(profile_id, service_id, updates)
    
    # Return updated service
    updated_profile = ProfileRepository.get_profile(profile_id)
    updated_service = next(
        (s for s in updated_profile.get("services", []) if s["id"] == service_id),
        None
    )
    return updated_service


@router.delete("/{profile_id}/services/{service_id}")
async def delete_service(profile_id: str, service_id: str):
    """Delete a service from a profile."""
    profile = ProfileRepository.get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    service_exists = any(s["id"] == service_id for s in profile.get("services", []))
    if not service_exists:
        raise HTTPException(status_code=404, detail="Service not found")
    
    ProfileRepository.delete_service_from_profile(profile_id, service_id)
    return {"message": "Service deleted successfully"}


@router.post("/{profile_id}/verify", response_model=BusinessProfile)
async def verify_profile(
    profile_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Verify a profile (owner or admin only).
    
    Args:
        profile_id: Profile ID
        current_user: Authenticated user (owner or admin)
        
    Returns:
        Updated BusinessProfile
        
    Raises:
        HTTPException: If profile not found or user not authorized
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Only owner can verify their profile
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can verify this profile"
        )
    
    ProfileRepository.update_profile(profile_id, {"is_verified": True})
    updated = ProfileRepository.get_profile(profile_id)
    
    return updated


@router.put("/{profile_id}/deactivate", response_model=BusinessProfile)
async def deactivate_profile(
    profile_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Deactivate a profile (owner only).
    
    Args:
        profile_id: Profile ID
        current_user: Authenticated owner user
        
    Returns:
        Updated BusinessProfile
        
    Raises:
        HTTPException: If profile not found or user not authorized
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can deactivate this profile"
        )
    
    ProfileRepository.update_profile(profile_id, {"is_active": False})
    updated = ProfileRepository.get_profile(profile_id)
    
    return updated


@router.put("/{profile_id}/activate", response_model=BusinessProfile)
async def activate_profile(
    profile_id: str,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Activate a profile (owner only).
    
    Args:
        profile_id: Profile ID
        current_user: Authenticated owner user
        
    Returns:
        Updated BusinessProfile
        
    Raises:
        HTTPException: If profile not found or user not authorized
    """
    profile = ProfileRepository.get_profile(profile_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile.get("owner_id") != current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only profile owner can activate this profile"
        )
    
    ProfileRepository.update_profile(profile_id, {"is_active": True})
    updated = ProfileRepository.get_profile(profile_id)
    
    return updated
