from fastapi import APIRouter, HTTPException, status, Depends
from core.security import hash_password, verify_password, create_access_token
from .models import UserRegister, UserLogin, UserResponse, TokenResponse, UserCredentials
from .repository import AuthRepository
from .security import get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    """
    Register a new user.
    
    Args:
        user_data: Registration data (username, name, password)
        
    Returns:
        UserResponse with created user info
        
    Raises:
        HTTPException: If username already exists
    """
    # Check if username already exists
    if AuthRepository.user_exists(user_data.username):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user
    user_doc = AuthRepository.create_user(
        username=user_data.username,
        name=user_data.name,
        password_hash=password_hash
    )
    
    return UserResponse(
        id=user_doc["id"],
        username=user_doc["username"],
        name=user_doc["name"],
        email=user_doc.get("email"),
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
    
    return UserResponse(
        id=user["id"],
        username=user["username"],
        name=user["name"],
        email=user.get("email"),
        created_at=user["created_at"]
    )
