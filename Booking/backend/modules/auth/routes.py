import os
from fastapi import APIRouter, HTTPException, status, Depends
from core.security import hash_password, verify_password, create_access_token, decode_token
from datetime import timedelta
from .models import (
    UserRegister, UserLogin, UserResponse, TokenResponse, UserCredentials,
    UserProfile, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest
)
from .repository import AuthRepository
from .security import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])

# Default owner ID for single-tenant mode (customers are linked to this owner)
DEFAULT_OWNER_ID = os.getenv("DEFAULT_OWNER_ID")


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """
    Register a new user.
    
    Args:
        user_data: Registration data (username, name, password, email)
        
    Returns:
        UserResponse with created user info
        
    Raises:
        HTTPException: If username or email already exists
    """
    # Check if username already exists
    if AuthRepository.user_exists(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user with owner_id for single-tenant mode
    user_doc = AuthRepository.create_user(
        username=user_data.username,
        name=user_data.name,
        password_hash=password_hash,
        email=user_data.email,
        owner_id=DEFAULT_OWNER_ID  # Link customer to default owner
    )

    print(f"USER PROC: {user_doc}")
    
    return UserResponse(
        id=user_doc["id"],
        username=user_doc["username"],
        name=user_doc["name"],
        email=user_doc.get("email"),
        role=user_doc.get("role", "USER"),
        owner_id=user_doc.get("owner_id"),
        created_at=user_doc["created_at"]
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login user and return JWT token.
    
    Args:
        credentials: Login credentials (username, password)
        
    Returns:
        TokenResponse with JWT access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by username
    user = AuthRepository.get_user_by_username(credentials.username)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Generate JWT token
    access_token = create_access_token(user_id=user["id"])
    
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserCredentials = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user (injected from JWT)
        
    Returns:
        UserResponse with user information
    """
    user = AuthRepository.get_user_by_id(current_user.user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        email=user.get("email"),
        role=user.get("role", "USER"),
        created_at=user["created_at"]
    )


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfile,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Update current user profile (name, email).
    
    Args:
        profile_data: Profile update data
        current_user: Authenticated user
        
    Returns:
        Updated UserResponse
    """
    updates = {}
    if profile_data.name:
        updates["name"] = profile_data.name
    if profile_data.email:
        updates["email"] = str(profile_data.email)
    
    if updates:
        AuthRepository.update_user(current_user.user_id, updates)
    
    user = AuthRepository.get_user_by_id(current_user.user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        email=user.get("email"),
        role=user.get("role", "USER"),
        created_at=user["created_at"]
    )


@router.put("/password", status_code=status.HTTP_200_OK)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: UserCredentials = Depends(get_current_user),
):
    """
    Change current user password.
    
    Args:
        password_data: Old and new password
        current_user: Authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If old password is incorrect
    """
    user = AuthRepository.get_user_by_id(current_user.user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not verify_password(password_data.old_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Old password is incorrect"
        )
    
    new_password_hash = hash_password(password_data.new_password)
    AuthRepository.update_user(current_user.user_id, {"password_hash": new_password_hash})
    
    return {"message": "Password changed successfully"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest):
    """
    Request password reset via email.
    
    Args:
        request: Email address for password reset
        
    Returns:
        Success message (always returns 200 for security)
    """
    user = AuthRepository.get_user_by_email(str(request.email))
    
    if user:
        # Generate password reset token (1 hour expiry)
        reset_token = create_access_token(user["id"], expires_delta=timedelta(hours=1))
        AuthRepository.update_user(user["id"], {"password_reset_token": reset_token})
        
        # In production, send email here with reset link
        # For now, just return success
    
    return {"message": "If email exists, a password reset link will be sent"}


@router.post("/reset-password", response_model=TokenResponse)
async def reset_password(request: ResetPasswordRequest):
    """
    Complete password reset with token.
    
    Args:
        request: Reset token and new password
        
    Returns:
        TokenResponse with new JWT token
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    user_id = decode_token(request.token)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired reset token"
        )
    
    user = AuthRepository.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password
    new_password_hash = hash_password(request.new_password)
    AuthRepository.update_user(user_id, {
        "password_hash": new_password_hash,
        "password_reset_token": None
    })
    
    # Generate new access token
    access_token = create_access_token(user_id)
    
    return TokenResponse(access_token=access_token, token_type="bearer")
