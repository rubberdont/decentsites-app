import os
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.security import decode_token
from .repository import AuthRepository
from .models import UserCredentials, UserRole


security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserCredentials:
    """
    Get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token from request header
        
    Returns:
        UserCredentials with verified user information
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    user_id = decode_token(token)
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Handle superadmin special case
    if user_id == "superadmin":
        superadmin_username = os.getenv("SUPERADMIN_USERNAME", "superadmin")
        return UserCredentials(
            user_id="superadmin",
            username=superadmin_username,
            name="Super Admin",
            role=UserRole.SUPERADMIN,
            must_change_password=False
        )
    
    user = AuthRepository.get_user_by_id(user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return UserCredentials(
        user_id=user["id"],
        username=user["username"],
        name=user["name"],
        role=user.get("role", "USER"),
        must_change_password=user.get("must_change_password", False)
    )


async def require_owner(current_user: UserCredentials = Depends(get_current_user)) -> UserCredentials:
    """
    Dependency to require owner or admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserCredentials if user is owner or admin
        
    Raises:
        HTTPException: If user is not owner or admin
    """
    if current_user.role not in [UserRole.OWNER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Owner access required"
        )
    return current_user


async def require_admin(current_user: UserCredentials = Depends(get_current_user)) -> UserCredentials:
    """
    Dependency to require admin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserCredentials if user is admin
        
    Raises:
        HTTPException: If user is not admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


async def require_superadmin(current_user: UserCredentials = Depends(get_current_user)) -> UserCredentials:
    """
    Dependency to require superadmin role.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserCredentials if user is superadmin
        
    Raises:
        HTTPException: If user is not superadmin
    """
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required"
        )
    return current_user
