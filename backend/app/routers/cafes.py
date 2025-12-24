from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Response
from typing import List
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import (
    CafeCreate, CafeUpdate, CafeResponse, TokenData
)
from app.auth import get_current_user, get_password_hash
from app.routers.auth import _get_request_user
from app.db_helpers import (
    get_persons_admins_collection, get_user_from_persons,
    get_cafe_information_collection, get_cafe_employees_collection,
    get_cafe_inventory_collection, get_cafe_offcodes_collection,
    get_cafe_products_collection, get_cafe_rewards_collection,
    get_cafe_rules_collection, get_cafe_shift_schedules_collection,
    get_cafe_images_collection
)
import os
from uuid import uuid4
import base64

router = APIRouter(prefix="/api/cafes", tags=["cafes"])


async def _ensure_manager_or_admin(db, current_user: TokenData):
    """Ensure the current user is a manager or admin"""
    user = await _get_request_user(db, current_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    if user.get("role") not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only managers and admins can access this resource"
        )
    return user


@router.get("/public", response_model=List[CafeResponse])
async def list_cafes_public():
    """
    Public endpoint to list all active cafes. No authentication required.
    Used for the main entry page where users can select a cafe.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    cafes_master = db["cafes_master"]
    cafes = []
    
    # Iterate through all cafes in master list
    async for master_entry in cafes_master.find({}):
        cafe_id = master_entry.get("cafe_id")
        if cafe_id is None:
            continue
        
        # Get café information from café-specific collection
        cafe_info_collection = get_cafe_information_collection(db, str(cafe_id))
        cafe_info = await cafe_info_collection.find_one({})
        
        if not cafe_info:
            continue
        
        # Only include active cafes
        if cafe_info.get("is_active") is False:
            continue
        
        try:
            cafe_response = CafeResponse(
                id=str(cafe_id),
                name=cafe_info.get("name", ""),
                location=cafe_info.get("location"),
                phone=cafe_info.get("phone"),
                email=cafe_info.get("email"),
                details=cafe_info.get("details"),
                hours=cafe_info.get("hours"),
                capacity=cafe_info.get("capacity"),
                wifi_password=cafe_info.get("wifi_password"),
                is_active=cafe_info.get("is_active", True),
                has_cinema=cafe_info.get("has_cinema", False),
                cinema_seating_capacity=cafe_info.get("cinema_seating_capacity"),
                has_coworking=cafe_info.get("has_coworking", False),
                coworking_capacity=cafe_info.get("coworking_capacity"),
                has_events=cafe_info.get("has_events", False),
                image_url=cafe_info.get("image_url"),
                logo_url=cafe_info.get("logo_url"),
                banner_url=cafe_info.get("banner_url"),
                created_at=cafe_info.get("created_at", datetime.utcnow()),
                updated_at=cafe_info.get("updated_at"),
                admin_id=cafe_info.get("admin_id")
            )
            cafes.append(cafe_response)
        except Exception as e:
            print(f"Error creating cafe response: {e}, cafe data: {cafe_info}")
            continue
    
    # Sort by created_at descending (newest first)
    cafes.sort(key=lambda x: x.created_at if x.created_at else datetime.min, reverse=True)
    
    return cafes


@router.get("", response_model=List[CafeResponse])
async def list_cafes(current_user: TokenData = Depends(get_current_user)):
    """
    List all cafes. Managers can see all cafes, admins can see all cafes.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    await _ensure_manager_or_admin(db, current_user)
    
    cafes_master = db["cafes_master"]
    cafes = []
    
    # Iterate through all cafes in master list
    async for master_entry in cafes_master.find({}):
        cafe_id = master_entry.get("cafe_id")
        if cafe_id is None:
            continue
        
        # Get café information from café-specific collection
        cafe_info_collection = get_cafe_information_collection(db, str(cafe_id))
        cafe_info = await cafe_info_collection.find_one({})
        
        if not cafe_info:
            continue
        
        # Only include active cafes
        if cafe_info.get("is_active") is False:
            continue
        
        try:
            cafe_response = CafeResponse(
                id=str(cafe_id),
                name=cafe_info.get("name", ""),
                location=cafe_info.get("location"),
                phone=cafe_info.get("phone"),
                email=cafe_info.get("email"),
                details=cafe_info.get("details"),
                hours=cafe_info.get("hours"),
                capacity=cafe_info.get("capacity"),
                wifi_password=cafe_info.get("wifi_password"),
                is_active=cafe_info.get("is_active", True),
                has_cinema=cafe_info.get("has_cinema", False),
                cinema_seating_capacity=cafe_info.get("cinema_seating_capacity"),
                has_coworking=cafe_info.get("has_coworking", False),
                coworking_capacity=cafe_info.get("coworking_capacity"),
                has_events=cafe_info.get("has_events", False),
                image_url=cafe_info.get("image_url"),
                logo_url=cafe_info.get("logo_url"),
                banner_url=cafe_info.get("banner_url"),
                created_at=cafe_info.get("created_at", datetime.utcnow()),
                updated_at=cafe_info.get("updated_at"),
                admin_id=cafe_info.get("admin_id")
            )
            cafes.append(cafe_response)
        except Exception as e:
            print(f"Error creating cafe response: {e}, cafe data: {cafe_info}")
            continue
    
    # Sort by created_at descending (newest first)
    cafes.sort(key=lambda x: x.created_at if x.created_at else datetime.min, reverse=True)
    
    return cafes


@router.post("/upload-cafe-image")
async def upload_cafe_image(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload a cafe image. Returns a URL that can be stored in cafe records.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )

    # Only managers or admins can upload cafe images
    await _ensure_manager_or_admin(db, current_user)

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": "cafe_image",
        "data": image_data_url,
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await images_collection.insert_one(image_doc)
    image_id = str(result.inserted_id)
    
    # Return URL pointing to image retrieval endpoint
    return {"url": f"/api/cafes/image/{image_id}"}


@router.post("/upload-cafe-logo")
async def upload_cafe_logo(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload a cafe logo. Returns a URL that can be stored in cafe records.
    Only admins can upload cafe logos.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )

    # Only admins can upload cafe logos
    user = await _get_request_user(db, current_user)
    if not user or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can upload cafe logos"
        )

    # Get cafe_id from user
    cafe_id = user.get("cafe_id")
    if not cafe_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cafe ID not found for user"
        )

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": "cafe_logo",
        "cafe_id": str(cafe_id),
        "data": image_data_url,
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await images_collection.insert_one(image_doc)
    image_id = str(result.inserted_id)
    
    # Update cafe information with logo URL
    cafe_info_collection = get_cafe_information_collection(db, str(cafe_id))
    await cafe_info_collection.update_one(
        {},
        {"$set": {"logo_url": f"/api/cafes/image/{image_id}"}}
    )
    
    # Return URL pointing to image retrieval endpoint
    return {"url": f"/api/cafes/image/{image_id}"}


@router.post("/upload-cafe-banner")
async def upload_cafe_banner(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload a cafe banner. Returns a URL that can be stored in cafe records.
    Only admins can upload cafe banners.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )

    # Only admins can upload cafe banners
    user = await _get_request_user(db, current_user)
    if not user or user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can upload cafe banners"
        )

    # Get cafe_id from user
    cafe_id = user.get("cafe_id")
    if not cafe_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cafe ID not found for user"
        )

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": "cafe_banner",
        "cafe_id": str(cafe_id),
        "data": image_data_url,
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await images_collection.insert_one(image_doc)
    image_id = str(result.inserted_id)
    
    # Update cafe information with banner URL
    cafe_info_collection = get_cafe_information_collection(db, str(cafe_id))
    await cafe_info_collection.update_one(
        {},
        {"$set": {"banner_url": f"/api/cafes/image/{image_id}"}}
    )
    
    # Return URL pointing to image retrieval endpoint
    return {"url": f"/api/cafes/image/{image_id}"}


@router.get("/image/{image_id}")
async def get_cafe_image(image_id: str):
    """Retrieve a cafe image by ID"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    images_collection = db["images"]
    try:
        image_oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image ID"
        )
    
    image_doc = await images_collection.find_one({
        "_id": image_oid, 
        "type": {"$in": ["cafe_image", "cafe_logo", "cafe_banner"]}
    })
    if not image_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Extract base64 data from data URL
    data_url = image_doc.get("data", "")
    if data_url.startswith("data:"):
        base64_data = data_url.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        content_type = image_doc.get("content_type", "image/jpeg")
        return Response(content=image_bytes, media_type=content_type)
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid image data format"
        )


@router.post("/upload-admin-document")
async def upload_admin_document(
    file: UploadFile = File(...),
    doc_type: str = "generic",
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload an admin KYC document (commitment, business license, national ID card).
    Returns a URL that can be stored in the cafe/admin records.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )

    # Only managers or admins can upload these documents
    await _ensure_manager_or_admin(db, current_user)

    allowed_types = {"commitment", "business_license", "national_id"}
    if doc_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document type"
        )

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": f"admin_{doc_type}",
        "content_type": file.content_type,
        "data": image_data_url,
        "created_at": datetime.utcnow()
    }
    image_result = await images_collection.insert_one(image_doc)
    image_id = str(image_result.inserted_id)
    
    # Return URL that points to the image retrieval endpoint
    url = f"/api/cafes/image/{image_id}"
    return {"url": url}


@router.post("", response_model=CafeResponse, status_code=status.HTTP_201_CREATED)
async def create_cafe(
    cafe_data: CafeCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Create a new cafe and automatically create an admin account for it.
    Only managers can create cafes.
    """
    # Log the incoming data for debugging (without password)
    import json
    debug_data = cafe_data.model_dump()
    debug_data['admin_password'] = '***'
    print(f"Received cafe creation request from user: {current_user.username or current_user.phone or current_user.user_id}")
    print(f"Cafe data: {json.dumps(debug_data, indent=2, default=str)}")
    """
    Create a new cafe and automatically create an admin account for it.
    Only managers can create cafes.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    await _ensure_manager_or_admin(db, current_user)
    
    # Check if cafe name already exists (search in all cafe information collections)
    # For now, we'll use a master cafes list to track cafe IDs
    cafes_master = db["cafes_master"]  # Master list of all cafes with their IDs
    
    # Validate required fields
    if not cafe_data.name or not cafe_data.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cafe name is required"
        )
    
    if not cafe_data.admin_username or not cafe_data.admin_username.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin username is required"
        )
    
    if not cafe_data.admin_password or not cafe_data.admin_password.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin password is required"
        )
    # Extended admin KYC required fields
    if not cafe_data.admin_first_name or not cafe_data.admin_first_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin first name is required"
        )
    if not cafe_data.admin_last_name or not cafe_data.admin_last_name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin last name is required"
        )
    if not cafe_data.admin_national_id or not cafe_data.admin_national_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin national ID is required"
        )
    if not cafe_data.admin_registration_date or not cafe_data.admin_registration_date.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin registration date is required"
        )
    if not cafe_data.admin_commitment_image_url or not cafe_data.admin_commitment_image_url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Commitment/contract image URL is required"
        )
    if not cafe_data.admin_business_license_image_url or not cafe_data.admin_business_license_image_url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Business license image URL is required"
        )
    if not cafe_data.admin_national_id_image_url or not cafe_data.admin_national_id_image_url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="National ID card image URL is required"
        )
    
    # Check if cafe name already exists in master list
    existing_cafe = await cafes_master.find_one({"name": cafe_data.name.strip()})
    if existing_cafe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cafe with name '{cafe_data.name}' already exists"
        )
    
    # Check if admin username already exists (search across all persons collections)
    existing_user, _ = await get_user_from_persons(db, username=cafe_data.admin_username.strip())
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{cafe_data.admin_username}' already exists"
        )
    
    # Helper function to convert empty strings to None
    def clean_value(v):
        if v is None:
            return None
        if isinstance(v, str) and v.strip() == "":
            return None
        if isinstance(v, str):
            return v.strip()
        return v
    
    # Get the next cafe_id number (auto-increment style)
    cafe_count = await cafes_master.count_documents({})
    new_cafe_id = cafe_count  # Use count as cafe_id
    
    # Create the cafe information document
    cafe_info_doc = {
        "name": cafe_data.name.strip(),
        "location": clean_value(cafe_data.location),
        "phone": clean_value(cafe_data.phone),
        "email": clean_value(cafe_data.email),
        "details": clean_value(cafe_data.details),
        "hours": clean_value(cafe_data.hours),
        "capacity": cafe_data.capacity if cafe_data.capacity is not None else None,
        "wifi_password": clean_value(cafe_data.wifi_password),
        "is_active": cafe_data.is_active,
        "has_cinema": cafe_data.has_cinema if hasattr(cafe_data, 'has_cinema') else False,
        "cinema_seating_capacity": cafe_data.cinema_seating_capacity if hasattr(cafe_data, 'cinema_seating_capacity') and cafe_data.has_cinema else None,
        "has_coworking": cafe_data.has_coworking if hasattr(cafe_data, 'has_coworking') else False,
        "coworking_capacity": cafe_data.coworking_capacity if hasattr(cafe_data, 'coworking_capacity') and cafe_data.has_coworking else None,
        "has_events": cafe_data.has_events if hasattr(cafe_data, 'has_events') else False,
        "image_url": clean_value(cafe_data.image_url) if hasattr(cafe_data, 'image_url') else None,
        "logo_url": clean_value(cafe_data.logo_url) if hasattr(cafe_data, 'logo_url') else None,
        "banner_url": clean_value(cafe_data.banner_url) if hasattr(cafe_data, 'banner_url') else None,
        "cafe_id": new_cafe_id,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    # Store cafe image in cafe-img collection if provided
    if cafe_data.image_url and hasattr(cafe_data, 'image_url') and cafe_data.image_url.strip():
        cafe_images_collection = get_cafe_images_collection(db, str(new_cafe_id))
        cafe_image_doc = {
            "image_url": clean_value(cafe_data.image_url),
            "created_at": datetime.utcnow()
        }
        await cafe_images_collection.insert_one(cafe_image_doc)
    
    # Store in café-specific information collection
    cafe_info_collection = get_cafe_information_collection(db, str(new_cafe_id))
    cafe_result = await cafe_info_collection.insert_one(cafe_info_doc)
    cafe_info_id = cafe_result.inserted_id
    
    # Also add to master cafes list for quick lookup
    master_doc = {
        "cafe_id": new_cafe_id,
        "name": cafe_data.name.strip(),
        "info_id": str(cafe_info_id),
        "created_at": datetime.utcnow()
    }
    await cafes_master.insert_one(master_doc)
    
    # Create the admin user in persons_admins collection
    hashed_password = get_password_hash(cafe_data.admin_password)
    admins_collection = get_persons_admins_collection(db)
    
    admin_doc = {
        "username": cafe_data.admin_username.strip(),
        "password": hashed_password,
        "email": clean_value(cafe_data.admin_email),
        "phone": clean_value(cafe_data.admin_phone),
        "name": f"{cafe_data.admin_first_name.strip()} {cafe_data.admin_last_name.strip()}".strip(),
        "role": "admin",
        "firstName": cafe_data.admin_first_name.strip(),
        "lastName": cafe_data.admin_last_name.strip(),
        "nationalId": cafe_data.admin_national_id.strip(),
        "registration_date": cafe_data.admin_registration_date.strip(),
        "commitment_image_url": clean_value(cafe_data.admin_commitment_image_url),
        "business_license_image_url": clean_value(cafe_data.admin_business_license_image_url),
        "national_id_image_url": clean_value(cafe_data.admin_national_id_image_url),
        "cafe_id": new_cafe_id,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    admin_result = await admins_collection.insert_one(admin_doc)
    admin_id = admin_result.inserted_id

    # Update cafe information with admin_id
    await cafe_info_collection.update_one(
        {"_id": cafe_info_id},
        {"$set": {"admin_id": str(admin_id)}}
    )
    
    # Fetch the created cafe information
    created_cafe = await cafe_info_collection.find_one({"_id": cafe_info_id})
    
    return CafeResponse(
        id=str(new_cafe_id),  # Use cafe_id as the main identifier
        name=created_cafe.get("name"),
        location=created_cafe.get("location"),
        phone=created_cafe.get("phone"),
        email=created_cafe.get("email"),
        details=created_cafe.get("details"),
        hours=created_cafe.get("hours"),
        capacity=created_cafe.get("capacity"),
        wifi_password=created_cafe.get("wifi_password"),
        is_active=created_cafe.get("is_active", True),
        has_cinema=created_cafe.get("has_cinema", False),
        cinema_seating_capacity=created_cafe.get("cinema_seating_capacity"),
        has_coworking=created_cafe.get("has_coworking", False),
        coworking_capacity=created_cafe.get("coworking_capacity"),
        has_events=created_cafe.get("has_events", False),
        image_url=created_cafe.get("image_url"),
        logo_url=created_cafe.get("logo_url"),
        banner_url=created_cafe.get("banner_url"),
        created_at=created_cafe.get("created_at", datetime.utcnow()),
        updated_at=created_cafe.get("updated_at"),
        admin_id=str(admin_id)
    )


@router.get("/{cafe_id}", response_model=CafeResponse)
async def get_cafe(
    cafe_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Get a specific cafe by ID.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    await _ensure_manager_or_admin(db, current_user)
    
    cafes_collection = db["cafes"]
    
    try:
        cafe = await cafes_collection.find_one({"_id": ObjectId(cafe_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cafe ID"
        )
    
    if not cafe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found"
        )
    
    return CafeResponse(
        id=str(cafe["_id"]),
        name=cafe.get("name"),
        location=cafe.get("location"),
        phone=cafe.get("phone"),
        email=cafe.get("email"),
        details=cafe.get("details"),
        hours=cafe.get("hours"),
        capacity=cafe.get("capacity"),
        wifi_password=cafe.get("wifi_password"),
        is_active=cafe.get("is_active", True),
        image_url=cafe.get("image_url"),
        logo_url=cafe.get("logo_url"),
        banner_url=cafe.get("banner_url"),
        created_at=cafe.get("created_at", datetime.utcnow()),
        updated_at=cafe.get("updated_at"),
        admin_id=str(cafe.get("admin_id")) if cafe.get("admin_id") else None
    )


@router.put("/{cafe_id}", response_model=CafeResponse)
async def update_cafe(
    cafe_id: str,
    cafe_update: CafeUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update a cafe's information.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    await _ensure_manager_or_admin(db, current_user)
    
    # Get cafe information from cafe-specific collection
    cafe_info_collection = get_cafe_information_collection(db, cafe_id)
    cafe_info = await cafe_info_collection.find_one({})
    
    if not cafe_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found"
        )
    
    # Build update document
    update_data = {}
    if cafe_update.name is not None:
        update_data["name"] = cafe_update.name
    if cafe_update.location is not None:
        update_data["location"] = cafe_update.location
    if cafe_update.phone is not None:
        update_data["phone"] = cafe_update.phone
    if cafe_update.email is not None:
        update_data["email"] = cafe_update.email
    if cafe_update.details is not None:
        update_data["details"] = cafe_update.details
    if cafe_update.hours is not None:
        update_data["hours"] = cafe_update.hours
    if cafe_update.capacity is not None:
        update_data["capacity"] = cafe_update.capacity
    if cafe_update.wifi_password is not None:
        update_data["wifi_password"] = cafe_update.wifi_password
    if cafe_update.is_active is not None:
        update_data["is_active"] = cafe_update.is_active
    if cafe_update.has_cinema is not None:
        update_data["has_cinema"] = cafe_update.has_cinema
    if cafe_update.cinema_seating_capacity is not None:
        update_data["cinema_seating_capacity"] = cafe_update.cinema_seating_capacity
    if cafe_update.has_coworking is not None:
        update_data["has_coworking"] = cafe_update.has_coworking
    if cafe_update.coworking_capacity is not None:
        update_data["coworking_capacity"] = cafe_update.coworking_capacity
    if cafe_update.has_events is not None:
        update_data["has_events"] = cafe_update.has_events
    if cafe_update.image_url is not None:
        update_data["image_url"] = cafe_update.image_url
        # Update cafe image in cafe-img collection
        cafe_images_collection = get_cafe_images_collection(db, cafe_id)
        # Remove old images
        await cafe_images_collection.delete_many({})
        # Add new image
        if cafe_update.image_url.strip():
            cafe_image_doc = {
                "image_url": cafe_update.image_url,
                "created_at": datetime.utcnow()
            }
            await cafe_images_collection.insert_one(cafe_image_doc)
    
    update_data["updated_at"] = datetime.utcnow()
    
    await cafe_info_collection.update_one(
        {},
        {"$set": update_data}
    )
    
    # Fetch updated cafe
    updated_cafe = await cafe_info_collection.find_one({})
    
    return CafeResponse(
        id=cafe_id,
        name=updated_cafe.get("name", ""),
        location=updated_cafe.get("location"),
        phone=updated_cafe.get("phone"),
        email=updated_cafe.get("email"),
        details=updated_cafe.get("details"),
        hours=updated_cafe.get("hours"),
        capacity=updated_cafe.get("capacity"),
        wifi_password=updated_cafe.get("wifi_password"),
        is_active=updated_cafe.get("is_active", True),
        has_cinema=updated_cafe.get("has_cinema", False),
        cinema_seating_capacity=updated_cafe.get("cinema_seating_capacity"),
        has_coworking=updated_cafe.get("has_coworking", False),
        coworking_capacity=updated_cafe.get("coworking_capacity"),
        has_events=updated_cafe.get("has_events", False),
        image_url=updated_cafe.get("image_url"),
        created_at=updated_cafe.get("created_at", datetime.utcnow()),
        updated_at=updated_cafe.get("updated_at"),
        admin_id=updated_cafe.get("admin_id")
    )


@router.delete("/{cafe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cafe(
    cafe_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Delete a cafe. This will also deactivate the admin account.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    await _ensure_manager_or_admin(db, current_user)
    
    cafes_collection = db["cafes"]
    users_collection = db["users"]
    admins_collection = db["admins"]
    
    try:
        cafe = await cafes_collection.find_one({"_id": ObjectId(cafe_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cafe ID"
        )
    
    if not cafe:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cafe not found"
        )
    
    # Deactivate the admin account instead of deleting
    admin_id = cafe.get("admin_id")
    if admin_id:
        try:
            admin_doc = await admins_collection.find_one({"_id": ObjectId(admin_id)})
        except Exception:
            admin_doc = None

        # If we stored admin_id as the admin record, deactivate admin record and linked user
        if admin_doc:
            user_id = admin_doc.get("user_id")
            if user_id:
                try:
                    await users_collection.update_one(
                        {"_id": ObjectId(user_id)},
                        {"$set": {"is_active": False}}
                    )
                except Exception:
                    pass
            try:
                await admins_collection.update_one(
                    {"_id": ObjectId(admin_id)},
                    {"$set": {"is_active": False}}
                )
            except Exception:
                pass
        else:
            # Fallback: if admin_id was a user_id
            try:
                await users_collection.update_one(
                    {"_id": ObjectId(admin_id)},
                    {"$set": {"is_active": False}}
                )
            except Exception:
                pass
    
    # Mark cafe as inactive instead of deleting
    await cafes_collection.update_one(
        {"_id": ObjectId(cafe_id)},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    return None


@router.get("/image/{image_id}")
async def get_admin_document_image(image_id: str):
    """
    Retrieve an admin document image from the database by ID.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    images_collection = db["images"]
    try:
        image_doc = await images_collection.find_one({"_id": ObjectId(image_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    if not image_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Extract base64 data from data URL
    data_url = image_doc.get("data", "")
    if data_url.startswith("data:"):
        # Extract base64 part
        base64_data = data_url.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        content_type = image_doc.get("content_type", "image/jpeg")
        return Response(content=image_bytes, media_type=content_type)
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid image data format"
        )

