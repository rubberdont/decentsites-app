import math
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from modules.auth.security import require_superadmin
from modules.auth.models import UserCredentials
from .models import (
    OwnerCreate, OwnerUpdate, OwnerResponse, OwnerListResponse,
    ResetOwnerPasswordRequest
)
from .repository import SuperadminRepository


router = APIRouter(prefix="/superadmin", tags=["superadmin"])


@router.get("/owners", response_model=OwnerListResponse)
async def list_owners(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    include_deleted: bool = False,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Get paginated list of owners (SUPERADMIN only)."""
    skip = (page - 1) * limit
    owners, total = SuperadminRepository.get_owners(
        skip=skip,
        limit=limit,
        search=search,
        include_deleted=include_deleted
    )
    
    total_pages = math.ceil(total / limit) if total > 0 else 1
    
    return OwnerListResponse(
        items=[
            OwnerResponse(
                id=o["id"],
                username=o["username"],
                name=o["name"],
                email=o.get("email"),
                role=o.get("role", "OWNER"),
                is_active=o.get("is_active", True),
                is_deleted=o.get("is_deleted", False),
                must_change_password=o.get("must_change_password", False),
                profile_count=o.get("profile_count", 0),
                created_at=o["created_at"],
                updated_at=o.get("updated_at")
            )
            for o in owners
        ],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.post("/owners", response_model=OwnerResponse, status_code=status.HTTP_201_CREATED)
async def create_owner(
    owner_data: OwnerCreate,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Create a new owner with default profile (SUPERADMIN only)."""
    # Check if username exists
    existing = SuperadminRepository.get_owner_by_username(owner_data.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )
    
    owner = SuperadminRepository.create_owner(
        username=owner_data.username,
        name=owner_data.name,
        email=str(owner_data.email) if owner_data.email else None,
        password=owner_data.password
    )
    
    return OwnerResponse(
        id=owner["id"],
        username=owner["username"],
        name=owner["name"],
        email=owner.get("email"),
        role=owner.get("role", "OWNER"),
        is_active=owner.get("is_active", True),
        is_deleted=owner.get("is_deleted", False),
        must_change_password=owner.get("must_change_password", False),
        profile_count=owner.get("profile_count", 0),
        created_at=owner["created_at"],
        updated_at=owner.get("updated_at")
    )


@router.get("/owners/{owner_id}", response_model=OwnerResponse)
async def get_owner(
    owner_id: str,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Get owner by ID (SUPERADMIN only)."""
    owner = SuperadminRepository.get_owner_by_id(owner_id)
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner not found"
        )
    
    return OwnerResponse(
        id=owner["id"],
        username=owner["username"],
        name=owner["name"],
        email=owner.get("email"),
        role=owner.get("role", "OWNER"),
        is_active=owner.get("is_active", True),
        is_deleted=owner.get("is_deleted", False),
        must_change_password=owner.get("must_change_password", False),
        profile_count=owner.get("profile_count", 0),
        created_at=owner["created_at"],
        updated_at=owner.get("updated_at")
    )


@router.put("/owners/{owner_id}", response_model=OwnerResponse)
async def update_owner(
    owner_id: str,
    owner_data: OwnerUpdate,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Update owner details (SUPERADMIN only)."""
    existing = SuperadminRepository.get_owner_by_id(owner_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner not found"
        )
    
    updates = {}
    if owner_data.name is not None:
        updates["name"] = owner_data.name
    if owner_data.email is not None:
        updates["email"] = str(owner_data.email)
    if owner_data.is_active is not None:
        updates["is_active"] = owner_data.is_active
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No updates provided"
        )
    
    owner = SuperadminRepository.update_owner(owner_id, updates)
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update owner"
        )
    
    return OwnerResponse(
        id=owner["id"],
        username=owner["username"],
        name=owner["name"],
        email=owner.get("email"),
        role=owner.get("role", "OWNER"),
        is_active=owner.get("is_active", True),
        is_deleted=owner.get("is_deleted", False),
        must_change_password=owner.get("must_change_password", False),
        profile_count=owner.get("profile_count", 0),
        created_at=owner["created_at"],
        updated_at=owner.get("updated_at")
    )


@router.delete("/owners/{owner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_owner(
    owner_id: str,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Soft delete an owner (SUPERADMIN only)."""
    existing = SuperadminRepository.get_owner_by_id(owner_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner not found"
        )
    
    success = SuperadminRepository.soft_delete_owner(owner_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete owner"
        )
    
    return None


@router.post("/owners/{owner_id}/restore", response_model=OwnerResponse)
async def restore_owner(
    owner_id: str,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Restore a soft-deleted owner (SUPERADMIN only)."""
    owner = SuperadminRepository.restore_owner(owner_id)
    
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner not found or not deleted"
        )
    
    return OwnerResponse(
        id=owner["id"],
        username=owner["username"],
        name=owner["name"],
        email=owner.get("email"),
        role=owner.get("role", "OWNER"),
        is_active=owner.get("is_active", True),
        is_deleted=owner.get("is_deleted", False),
        must_change_password=owner.get("must_change_password", False),
        profile_count=owner.get("profile_count", 0),
        created_at=owner["created_at"],
        updated_at=owner.get("updated_at")
    )


@router.post("/owners/{owner_id}/reset-password", status_code=status.HTTP_200_OK)
async def reset_owner_password(
    owner_id: str,
    current_user: UserCredentials = Depends(require_superadmin)
):
    """Reset owner password to default (SUPERADMIN only)."""
    existing = SuperadminRepository.get_owner_by_id(owner_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner not found"
        )
    
    success = SuperadminRepository.reset_owner_password(owner_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reset password"
        )
    
    return {"message": "Password reset to default. Owner must change it on next login."}
