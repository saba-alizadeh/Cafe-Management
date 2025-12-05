from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.database import get_database
from app.models import UserCreate, UserLogin, UserResponse, Token
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user
    """
    db = get_database()
    users_collection = db["users"]
    
    # Check if username already exists
    existing_user = await users_collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await users_collection.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate role-specific requirements
    if user_data.role != "customer" and user_data.cafe_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{user_data.role} must have a cafe_id"
        )
    
    if user_data.role == "customer" and user_data.cafe_id is not None:
        user_data.cafe_id = None  # Customers don't belong to specific cafes
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_dict = user_data.model_dump()
    user_dict["password"] = hashed_password
    user_dict["created_at"] = user_dict.get("created_at", None) or None
    
    # Insert user into database
    result = await users_collection.insert_one(user_dict)
    
    # Fetch the created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Return user response (without password)
    return UserResponse(
        id=str(created_user["_id"]),
        username=created_user["username"],
        email=created_user["email"],
        role=created_user["role"],
        name=created_user["name"],
        cafe_id=created_user.get("cafe_id"),
        created_at=created_user.get("created_at"),
        is_active=created_user.get("is_active", True)
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """
    Authenticate user and return access token
    """
    db = get_database()
    users_collection = db["users"]
    
    # Find user by username
    user = await users_collection.find_one({"username": credentials.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    # Create user response
    user_response = UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        role=user["role"],
        name=user["name"],
        cafe_id=user.get("cafe_id"),
        created_at=user.get("created_at"),
        is_active=user.get("is_active", True)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    db = get_database()
    users_collection = db["users"]
    
    user = await users_collection.find_one({"username": current_user.username})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        username=user["username"],
        email=user["email"],
        role=user["role"],
        name=user["name"],
        cafe_id=user.get("cafe_id"),
        created_at=user.get("created_at"),
        is_active=user.get("is_active", True)
    )

