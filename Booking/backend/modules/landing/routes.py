from fastapi import APIRouter, HTTPException, status, Depends
import uuid

from .models import (
    LandingPageConfig, 
    LandingPageConfigUpdate,
    CTAButtonConfig,
    HeroSection,
    FinalCTASection
)
from .repository import LandingRepository
from modules.auth.security import get_current_user
from modules.auth.models import UserCredentials

router = APIRouter(prefix="/landing", tags=["landing"])


def enforce_cta_constraints(config_dict: dict) -> dict:
    """
    CRITICAL: Enforce that CTA buttons always exist and have valid values.
    This ensures the Book Now button can never be removed.
    """
    # Ensure hero section exists with CTA
    if "hero" not in config_dict or config_dict["hero"] is None:
        config_dict["hero"] = HeroSection().model_dump()
    
    if "cta_button" not in config_dict["hero"] or config_dict["hero"]["cta_button"] is None:
        config_dict["hero"]["cta_button"] = CTAButtonConfig().model_dump()
    
    # Ensure hero CTA has valid text
    hero_cta = config_dict["hero"]["cta_button"]
    if not hero_cta.get("text") or len(hero_cta.get("text", "")) < 2:
        hero_cta["text"] = "Book Now"
    
    # Ensure final_cta section exists with CTA
    if "final_cta" not in config_dict or config_dict["final_cta"] is None:
        config_dict["final_cta"] = FinalCTASection().model_dump()
    
    if "cta_button" not in config_dict["final_cta"] or config_dict["final_cta"]["cta_button"] is None:
        config_dict["final_cta"]["cta_button"] = CTAButtonConfig().model_dump()
    
    # Ensure final CTA has valid text
    final_cta = config_dict["final_cta"]["cta_button"]
    if not final_cta.get("text") or len(final_cta.get("text", "")) < 2:
        final_cta["text"] = "Book Now"
    
    return config_dict


@router.get("/config", response_model=LandingPageConfig)
async def get_landing_config(
    current_user: UserCredentials = Depends(get_current_user)
):
    """
    Get the current user's landing page configuration.
    Creates a default config if none exists.
    """
    config = LandingRepository.get_config_by_owner(current_user.user_id)
    
    if not config:
        # Create default config for this owner
        default_config = LandingPageConfig(
            id=str(uuid.uuid4()),
            owner_id=current_user.user_id
        )
        config_dict = default_config.model_dump()
        config_dict = enforce_cta_constraints(config_dict)
        LandingRepository.create_config(config_dict)
        return config_dict
    
    # Ensure CTA constraints are met on existing config
    config = enforce_cta_constraints(config)
    return config


@router.put("/config", response_model=LandingPageConfig)
async def update_landing_config(
    updates: LandingPageConfigUpdate,
    current_user: UserCredentials = Depends(get_current_user)
):
    """
    Update the current user's landing page configuration.
    CTA buttons are enforced and cannot be removed.
    """
    # Get existing config or create new
    existing = LandingRepository.get_config_by_owner(current_user.user_id)
    
    if not existing:
        # Create new config with updates
        new_config = LandingPageConfig(
            id=str(uuid.uuid4()),
            owner_id=current_user.user_id
        )
        config_dict = new_config.model_dump()
    else:
        config_dict = existing
    
    # Apply updates (only non-None fields)
    update_data = updates.model_dump(exclude_none=True)
    for key, value in update_data.items():
        config_dict[key] = value
    
    # CRITICAL: Enforce CTA constraints
    config_dict = enforce_cta_constraints(config_dict)
    
    # Save
    if existing:
        LandingRepository.update_config(current_user.user_id, config_dict)
    else:
        LandingRepository.create_config(config_dict)
    
    return config_dict


@router.post("/config/publish", response_model=LandingPageConfig)
async def publish_landing_config(
    current_user: UserCredentials = Depends(get_current_user)
):
    """
    Publish the landing page configuration to make it live.
    """
    config = LandingRepository.get_config_by_owner(current_user.user_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No landing page configuration found. Create one first."
        )
    
    # Enforce CTA constraints before publishing
    config = enforce_cta_constraints(config)
    config["is_published"] = True
    LandingRepository.update_config(current_user.user_id, config)
    
    return config


@router.post("/config/unpublish", response_model=LandingPageConfig)
async def unpublish_landing_config(
    current_user: UserCredentials = Depends(get_current_user)
):
    """
    Unpublish the landing page (revert to draft).
    """
    config = LandingRepository.get_config_by_owner(current_user.user_id)
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No landing page configuration found."
        )
    
    LandingRepository.unpublish_config(current_user.user_id)
    config["is_published"] = False
    
    return config


@router.get("/public")
async def get_public_landing_config():
    """
    PUBLIC ENDPOINT - No authentication required.
    Get the published landing page configuration for the frontend.
    Returns default values if no published config exists.
    """
    config = LandingRepository.get_published_config()
    
    if not config:
        # Return default config for public display
        default_config = LandingPageConfig(
            id="default",
            owner_id="default",
            is_published=True
        )
        return default_config.model_dump()
    
    # Ensure CTA constraints (defensive)
    config = enforce_cta_constraints(config)
    
    # Remove internal fields from public response
    config.pop("_id", None)
    
    return config
