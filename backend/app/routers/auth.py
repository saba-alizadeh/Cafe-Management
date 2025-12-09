from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta, datetime
from bson import ObjectId
from app.database import get_database, connect_to_mongo
from app.models import (
    UserCreate, UserLogin, UserResponse, Token, 
    PhoneLoginRequest, PhoneLoginComplete, ProfileUpdate, TokenData, VerifyOTPRequest,
    EmployeeCreate, EmployeeResponse, EmployeeStatusUpdate
)
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Default OTP for testing
DEFAULT_OTP = "123456"


async def _get_request_user(db, current_user: TokenData):
    users_collection = db["users"]
    user = None
    if current_user.user_id:
        try:
            user = await users_collection.find_one({"_id": ObjectId(current_user.user_id)})
        except Exception:
            user = None
    if not user and current_user.username:
        user = await users_collection.find_one({"username": current_user.username})
    if not user and current_user.phone:
        user = await users_collection.find_one({"phone": current_user.phone})
    return user


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    """
    Register a new user
    Validates user information, creates a new user, generates a JWT, and returns the token
    """
    db = get_database()
    users_collection = db["users"]
    
    # Validate that either username+email+password OR phone is provided
    if not user_data.phone and (not user_data.username or not user_data.email or not user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either phone number or username+email+password must be provided"
        )
    
    # Check if username already exists (if provided)
    if user_data.username:
        existing_user = await users_collection.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
    
    # Check if email already exists (if provided)
    if user_data.email:
        existing_email = await users_collection.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if phone already exists (if provided)
    if user_data.phone:
        existing_phone = await users_collection.find_one({"phone": user_data.phone})
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered"
            )
    
    # Validate role-specific requirements
    if user_data.role != "customer" and user_data.cafe_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{user_data.role} must have a cafe_id"
        )
    
    if user_data.role == "customer" and user_data.cafe_id is not None:
        user_data.cafe_id = None  # Customers don't belong to specific cafes
    
    # Hash password if provided
    hashed_password = None
    if user_data.password:
        hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_dict = user_data.model_dump(exclude_none=True)
    if hashed_password:
        user_dict["password"] = hashed_password
    
    # Insert user into database
    result = await users_collection.insert_one(user_dict)
    
    # Fetch the created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    token_data = {}
    if created_user.get("username"):
        token_data["sub"] = created_user["username"]
    if created_user.get("phone"):
        token_data["phone"] = created_user["phone"]
    token_data["user_id"] = str(created_user["_id"])
    token_data["role"] = created_user["role"]
    
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )
    
    # Create user response
    user_response = UserResponse(
        id=str(created_user["_id"]),
        username=created_user.get("username"),
        email=created_user.get("email"),
        phone=created_user.get("phone"),
        role=created_user["role"],
        name=created_user["name"],
        firstName=created_user.get("firstName"),
        lastName=created_user.get("lastName"),
        address=created_user.get("address"),
        details=created_user.get("details"),
        cafe_id=created_user.get("cafe_id"),
        created_at=created_user.get("created_at"),
        is_active=created_user.get("is_active", True)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/login")
async def login(credentials: PhoneLoginRequest):
    """
    Phone-based authentication
    Step 1: Send phone number, receive OTP (default: 123456)
    Step 2: If user exists, verify OTP and return JWT
    Step 3: If user doesn't exist, require additional info via PhoneLoginComplete
    """
    try:
        # Development bypass: skip DB/OTP entirely
        if settings.bypass_auth:
            return {
                "message": "Auth bypass enabled (dev)",
                "otp_required": False,
                "default_otp": DEFAULT_OTP,
                "user_exists": True,
                "token": "dev-bypass-token",
                "user": {
                    "id": "dev-user-id",
                    "phone": credentials.phone,
                    "role": "customer",
                    "name": credentials.phone,
                    "is_active": True
                }
            }

        db = get_database()
        if db is None:
            # Try to connect lazily in case startup hook failed or was skipped
            await connect_to_mongo()
            db = get_database()
            if db is None:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Database connection not available. Please check MongoDB connection."
                )
        
        users_collection = db["users"]
        
        # Phone already normalized by the model validator
        phone = credentials.phone
        
        # Find user by phone number with timeout handling
        try:
            user = await users_collection.find_one({"phone": phone})
        except Exception as db_error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database query failed: {str(db_error)}"
            )
        
        # Step 1: If no OTP provided, send OTP (simulate SMS sending)
        if not credentials.otp:
            # If user doesn't exist, create a basic user record with just phone number
            if not user:
                try:
                    user_dict = {
                        "phone": phone,
                        "role": "customer",
                        "name": phone,  # Temporary name, will be updated with personal info
                        "is_active": True,
                        "created_at": datetime.utcnow()
                    }
                    result = await users_collection.insert_one(user_dict)
                    user = await users_collection.find_one({"_id": result.inserted_id})
                    print(f"Created new user record for phone: {phone}")
                except Exception as create_error:
                    print(f"Error creating user: {create_error}")
                    # Continue anyway - user might already exist from race condition
            
            # In production, send SMS here with actual OTP
            # For now, we return a message indicating OTP was sent
            # The frontend should use the default OTP: 123456
            return {
                "message": "OTP sent to phone number",
                "otp_required": True,
                "default_otp": DEFAULT_OTP,  # For testing only
                "user_exists": user is not None
            }
        
        # Step 2: Verify OTP
        if credentials.otp != DEFAULT_OTP:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid OTP code"
            )
        
        # Step 3: If user exists, approve login and return JWT
        if user:
            # Check if user is active
            if not user.get("is_active", True):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="User account is inactive"
                )
            
            # Create access token
            access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
            token_data = {}
            if user.get("username"):
                token_data["sub"] = user["username"]
            token_data["phone"] = user["phone"]
            token_data["user_id"] = str(user["_id"])
            token_data["role"] = user["role"]
            
            access_token = create_access_token(
                data=token_data,
                expires_delta=access_token_expires
            )
            
            # Create user response
            user_response = UserResponse(
                id=str(user["_id"]),
                username=user.get("username"),
                email=user.get("email"),
                phone=user.get("phone"),
                role=user["role"],
                name=user["name"],
                firstName=user.get("firstName"),
                lastName=user.get("lastName"),
                address=user.get("address"),
                details=user.get("details"),
                cafe_id=user.get("cafe_id"),
                created_at=user.get("created_at"),
                is_active=user.get("is_active", True)
            )
            
            return Token(
                access_token=access_token,
                token_type="bearer",
                user=user_response
            )
        
        # Step 4: If user doesn't exist, require additional information
        # This should be handled by a separate endpoint or the frontend should
        # call signup with the additional info after OTP verification
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please complete registration with additional information."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/admin-login", response_model=Token)
async def admin_login(credentials: UserLogin):
    """
    Username/password login for admin and manager roles.
    """
    if not credentials.username or not credentials.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required"
        )

    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available. Please check MongoDB connection."
            )

    users_collection = db["users"]

    user = await users_collection.find_one({"username": credentials.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if user.get("role") not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for this user"
        )

    if not user.get("password") or not verify_password(credentials.password, user.get("password")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    token_data = {
        "sub": user.get("username"),
        "user_id": str(user["_id"]),
        "role": user["role"],
        "phone": user.get("phone")
    }

    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires
    )

    user_response = UserResponse(
        id=str(user["_id"]),
        username=user.get("username"),
        email=user.get("email"),
        phone=user.get("phone"),
        role=user["role"],
        name=user.get("name"),
        firstName=user.get("firstName"),
        lastName=user.get("lastName"),
        address=user.get("address"),
        details=user.get("details"),
        cafe_id=user.get("cafe_id"),
        created_at=user.get("created_at"),
        is_active=user.get("is_active", True)
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.post("/verify-otp")
async def verify_otp(otp_request: VerifyOTPRequest):
    """
    Verify OTP code and return JWT token
    Returns token, isNewUser flag, and user data
    """
    try:
        if settings.bypass_auth:
            # Return a stub token/user without DB or OTP checks
            return {
                "token": "dev-bypass-token",
                "isNewUser": False,
                "user": {
                    "id": "dev-user-id",
                    "phone": otp_request.phone,
                    "role": "customer",
                    "name": otp_request.phone,
                    "is_active": True
                }
            }

        db = get_database()
        if db is None:
            await connect_to_mongo()
            db = get_database()
            if db is None:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Database connection not available. Please check MongoDB connection."
                )
        
        users_collection = db["users"]
        
        # Phone already normalized by the model validator
        phone = otp_request.phone
        
        # Verify OTP code
        if otp_request.code != DEFAULT_OTP:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired code"
            )
        
        # Find user by phone number with error handling
        try:
            user = await users_collection.find_one({"phone": phone})
        except Exception as db_error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Database connection error: {str(db_error)}. Please ensure MongoDB is running."
            )
        
        # If user doesn't exist, create a basic user record
        if not user:
            try:
                user_dict = {
                    "phone": phone,
                    "role": "customer",
                    "name": phone,  # Temporary name
                    "is_active": True,
                    "created_at": datetime.utcnow()
                }
                result = await users_collection.insert_one(user_dict)
                user = await users_collection.find_one({"_id": result.inserted_id})
            except Exception as create_error:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error creating user: {str(create_error)}"
                )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Check if user has complete information (firstName and lastName are required)
        has_complete_info = user.get("firstName") and user.get("lastName")
        is_new_user = not has_complete_info
        
        # Create access token (even for incomplete users, so they can complete registration)
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        token_data = {}
        if user.get("username"):
            token_data["sub"] = user["username"]
        token_data["phone"] = user["phone"]
        token_data["user_id"] = str(user["_id"])
        token_data["role"] = user["role"]
        
        access_token = create_access_token(
            data=token_data,
            expires_delta=access_token_expires
        )
        
        # Create user response
        user_response = UserResponse(
            id=str(user["_id"]),
            username=user.get("username"),
            email=user.get("email"),
            phone=user.get("phone"),
            role=user["role"],
            name=user.get("name", phone),
            firstName=user.get("firstName"),
            lastName=user.get("lastName"),
            address=user.get("address"),
            details=user.get("details"),
            cafe_id=user.get("cafe_id"),
            created_at=user.get("created_at"),
            is_active=user.get("is_active", True)
        )
        
        # Return format expected by frontend
        return {
            "token": access_token,
            "isNewUser": is_new_user,
            "user": user_response.model_dump()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/login/complete", response_model=Token)
async def complete_login(profile_data: PhoneLoginComplete):
    """
    Complete login for new users after OTP verification
    Requires: phone, firstName, lastName, address, and other details
    """
    db = get_database()
    users_collection = db["users"]
    
    # Normalize phone number
    phone = profile_data.phone.replace("+", "").replace("-", "").replace(" ", "")
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"phone": phone})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists. Please use login endpoint."
        )
    
    # Create new user with phone-based authentication
    # Generate name from firstName and lastName if name not provided
    name = f"{profile_data.firstName or ''} {profile_data.lastName or ''}".strip()
    if not name:
        name = phone  # Fallback to phone if no name provided
    
    user_dict = {
        "phone": phone,
        "role": "customer",  # Default role for phone-based signup
        "name": name,
        "firstName": profile_data.firstName,
        "lastName": profile_data.lastName,
        "address": profile_data.address,
        "details": profile_data.details,
        "cafe_id": None,
        "is_active": True
    }
    
    # Insert user into database
    result = await users_collection.insert_one(user_dict)
    
    # Fetch the created user
    created_user = await users_collection.find_one({"_id": result.inserted_id})
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={
            "phone": created_user["phone"],
            "user_id": str(created_user["_id"]),
            "role": created_user["role"]
        },
        expires_delta=access_token_expires
    )
    
    # Create user response
    user_response = UserResponse(
        id=str(created_user["_id"]),
        username=created_user.get("username"),
        email=created_user.get("email"),
        phone=created_user.get("phone"),
        role=created_user["role"],
        name=created_user["name"],
        firstName=created_user.get("firstName"),
        lastName=created_user.get("lastName"),
        address=created_user.get("address"),
        details=created_user.get("details"),
        cafe_id=created_user.get("cafe_id"),
        created_at=created_user.get("created_at"),
        is_active=created_user.get("is_active", True)
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_response
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: TokenData = Depends(get_current_user)):
    """
    Get current authenticated user information
    Identifies user from token and returns user information
    Only works with a valid token
    """
    db = get_database()
    users_collection = db["users"]
    
    # Find user by username, phone, or user_id
    user = None
    if current_user.user_id:
        try:
            user = await users_collection.find_one({"_id": ObjectId(current_user.user_id)})
        except:
            pass
    if not user and current_user.username:
        user = await users_collection.find_one({"username": current_user.username})
    if not user and current_user.phone:
        user = await users_collection.find_one({"phone": current_user.phone})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        username=user.get("username"),
        email=user.get("email"),
        phone=user.get("phone"),
        role=user["role"],
        name=user["name"],
        firstName=user.get("firstName"),
        lastName=user.get("lastName"),
        address=user.get("address"),
        details=user.get("details"),
        cafe_id=user.get("cafe_id"),
        created_at=user.get("created_at"),
        is_active=user.get("is_active", True)
    )


@router.put("/update", response_model=UserResponse)
async def update_profile(
    profile_update: ProfileUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update user profile information
    Validates security and permissions, saves changes, and returns updated user
    """
    db = get_database()
    users_collection = db["users"]
    
    # Find user
    user = None
    if current_user.user_id:
        try:
            user = await users_collection.find_one({"_id": ObjectId(current_user.user_id)})
        except:
            pass
    if not user and current_user.username:
        user = await users_collection.find_one({"username": current_user.username})
    if not user and current_user.phone:
        user = await users_collection.find_one({"phone": current_user.phone})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Prepare update data (only include fields that are provided)
    update_data = {}
    if profile_update.firstName is not None:
        update_data["firstName"] = profile_update.firstName
    if profile_update.lastName is not None:
        update_data["lastName"] = profile_update.lastName
    if profile_update.phone is not None:
        # Check if phone is already taken by another user
        phone = profile_update.phone.replace("+", "").replace("-", "").replace(" ", "")
        existing_phone = await users_collection.find_one({
            "phone": phone,
            "_id": {"$ne": user["_id"]}
        })
        if existing_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered to another user"
            )
        update_data["phone"] = phone
    if profile_update.address is not None:
        update_data["address"] = profile_update.address
    if profile_update.details is not None:
        update_data["details"] = profile_update.details
    if profile_update.name is not None:
        update_data["name"] = profile_update.name
    elif profile_update.firstName is not None or profile_update.lastName is not None:
        # Update name if firstName or lastName changed
        firstName = update_data.get("firstName", user.get("firstName", ""))
        lastName = update_data.get("lastName", user.get("lastName", ""))
        name = f"{firstName} {lastName}".strip()
        if name:
            update_data["name"] = name
    
    # Update user in database
    if update_data:
        await users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": update_data}
        )
    
    # Fetch updated user
    updated_user = await users_collection.find_one({"_id": user["_id"]})
    
    return UserResponse(
        id=str(updated_user["_id"]),
        username=updated_user.get("username"),
        email=updated_user.get("email"),
        phone=updated_user.get("phone"),
        role=updated_user["role"],
        name=updated_user["name"],
        firstName=updated_user.get("firstName"),
        lastName=updated_user.get("lastName"),
        address=updated_user.get("address"),
        details=updated_user.get("details"),
        cafe_id=updated_user.get("cafe_id"),
        created_at=updated_user.get("created_at"),
        is_active=updated_user.get("is_active", True)
    )


# --------------------
# Employees (admin-only)
# --------------------


def _require_admin(user):
    if not user or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can manage employees"
        )


@router.get("/employees", response_model=list[EmployeeResponse])
async def list_employees(current_user: TokenData = Depends(get_current_user)):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    employees_collection = db["employees"]
    cursor = employees_collection.find({})
    employees = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        employees.append(EmployeeResponse(**doc))
    return employees


@router.post("/employees", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate, current_user: TokenData = Depends(get_current_user)):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    employees_collection = db["employees"]

    # Unique constraints: nationalId and phone
    existing_nid = await employees_collection.find_one({"nationalId": employee.nationalId})
    if existing_nid:
        raise HTTPException(status_code=400, detail="کد ملی قبلا ثبت شده است.")
    existing_phone = await employees_collection.find_one({"phone": employee.phone})
    if existing_phone:
        raise HTTPException(status_code=400, detail="شماره تلفن قبلا ثبت شده است.")

    doc = employee.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await employees_collection.insert_one(doc)
    created = await employees_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return EmployeeResponse(**created)


@router.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: str, current_user: TokenData = Depends(get_current_user)):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    employees_collection = db["employees"]
    try:
        oid = ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="شناسه نامعتبر است.")

    await employees_collection.delete_one({"_id": oid})
    return None


@router.patch("/employees/{employee_id}/status", response_model=EmployeeResponse)
async def update_employee_status(
    employee_id: str,
    status_payload: EmployeeStatusUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    employees_collection = db["employees"]
    try:
        oid = ObjectId(employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="شناسه نامعتبر است.")

    update_result = await employees_collection.update_one(
        {"_id": oid},
        {"$set": {"is_active": status_payload.is_active}}
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="کارمند یافت نشد.")

    updated = await employees_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return EmployeeResponse(**updated)
