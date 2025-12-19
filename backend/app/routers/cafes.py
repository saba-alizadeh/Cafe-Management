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
    
    cafes_collection = db["cafes"]
    users_collection = db["users"]
    admins_collection = db["admins"]
    admins_collection = db["admins"]
    admins_collection = db["admins"]
    admins_collection = db["admins"]
    admins_collection = db["admins"]
    
    cafes = []
    # Only active cafes
    async for cafe in cafes_collection.find({"is_active": {"$ne": False}}):
        # Find the admin user for this cafe
        admin_id = cafe.get("admin_id")
        admin_user = None
        if admin_id:
            try:
                admin_user = await users_collection.find_one({"_id": ObjectId(admin_id)})
            except Exception as e:
                print(f"Error finding admin user: {e}")
                pass
        
        try:
            cafe_response = CafeResponse(
                id=str(cafe["_id"]),
                name=cafe.get("name", ""),
                location=cafe.get("location"),
                phone=cafe.get("phone"),
                email=cafe.get("email"),
                details=cafe.get("details"),
                hours=cafe.get("hours"),
                capacity=cafe.get("capacity"),
                wifi_password=cafe.get("wifi_password"),
                is_active=cafe.get("is_active", True),
                created_at=cafe.get("created_at", datetime.utcnow()),
                updated_at=cafe.get("updated_at"),
                admin_id=str(admin_id) if admin_id else None
            )
            cafes.append(cafe_response)
        except Exception as e:
            print(f"Error creating cafe response: {e}, cafe data: {cafe}")
            continue
    
    # Sort by created_at descending (newest first)
    cafes.sort(key=lambda x: x.created_at if x.created_at else datetime.min, reverse=True)
    
    return cafes


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
    
    cafes_collection = db["cafes"]
    users_collection = db["users"]
    admins_collection = db["admins"]
    
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
    
    # Check if cafe name already exists
    existing_cafe = await cafes_collection.find_one({"name": cafe_data.name.strip()})
    if existing_cafe:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cafe with name '{cafe_data.name}' already exists"
        )
    
    # Check if admin username already exists
    existing_user = await users_collection.find_one({"username": cafe_data.admin_username.strip()})
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
    
    # Create the cafe first
    cafe_doc = {
        "name": cafe_data.name.strip(),
        "location": clean_value(cafe_data.location),
        "phone": clean_value(cafe_data.phone),
        "email": clean_value(cafe_data.email),
        "details": clean_value(cafe_data.details),
        "hours": clean_value(cafe_data.hours),
        "capacity": cafe_data.capacity if cafe_data.capacity is not None else None,
        "wifi_password": clean_value(cafe_data.wifi_password),
        "is_active": cafe_data.is_active,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    cafe_result = await cafes_collection.insert_one(cafe_doc)
    cafe_id = cafe_result.inserted_id
    
    # Get the next cafe_id number (auto-increment style)
    # Count existing cafes to generate a unique cafe_id
    cafe_count = await cafes_collection.count_documents({})
    new_cafe_id = cafe_count  # Use count as cafe_id
    
    # Create the admin user for this cafe (users collection)
    hashed_password = get_password_hash(cafe_data.admin_password)
    user_doc = {
        "username": cafe_data.admin_username.strip(),
        "password": hashed_password,
        "email": clean_value(cafe_data.admin_email),
        "phone": clean_value(cafe_data.admin_phone),
        "name": f"{cafe_data.admin_first_name.strip()} {cafe_data.admin_last_name.strip()}".strip(),
        "role": "admin",
        "firstName": cafe_data.admin_first_name.strip(),
        "lastName": cafe_data.admin_last_name.strip(),
        "cafe_id": new_cafe_id,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    user_result = await users_collection.insert_one(user_doc)
    user_id = user_result.inserted_id

    # Create a separate admin record (admins collection)
    admin_doc = {
        "user_id": user_id,
        "name": f"{cafe_data.admin_first_name.strip()} {cafe_data.admin_last_name.strip()}".strip(),
        "username": cafe_data.admin_username.strip(),
        "email": clean_value(cafe_data.admin_email),
        "phone": clean_value(cafe_data.admin_phone),
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

    # Update cafe with admin_id and cafe_id
    await cafes_collection.update_one(
        {"_id": cafe_id},
        {"$set": {"admin_id": admin_id, "cafe_id": new_cafe_id}}
    )
    
    # Fetch the created cafe
    created_cafe = await cafes_collection.find_one({"_id": cafe_id})
    
    return CafeResponse(
        id=str(created_cafe["_id"]),
        name=created_cafe.get("name"),
        location=created_cafe.get("location"),
        phone=created_cafe.get("phone"),
        email=created_cafe.get("email"),
        details=created_cafe.get("details"),
        hours=created_cafe.get("hours"),
        capacity=created_cafe.get("capacity"),
        wifi_password=created_cafe.get("wifi_password"),
        is_active=created_cafe.get("is_active", True),
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
    
    update_data["updated_at"] = datetime.utcnow()
    
    await cafes_collection.update_one(
        {"_id": ObjectId(cafe_id)},
        {"$set": update_data}
    )
    
    # Fetch updated cafe
    updated_cafe = await cafes_collection.find_one({"_id": ObjectId(cafe_id)})
    
    return CafeResponse(
        id=str(updated_cafe["_id"]),
        name=updated_cafe.get("name"),
        location=updated_cafe.get("location"),
        phone=updated_cafe.get("phone"),
        email=updated_cafe.get("email"),
        details=updated_cafe.get("details"),
        hours=updated_cafe.get("hours"),
        capacity=updated_cafe.get("capacity"),
        wifi_password=updated_cafe.get("wifi_password"),
        is_active=updated_cafe.get("is_active", True),
        created_at=updated_cafe.get("created_at", datetime.utcnow()),
        updated_at=updated_cafe.get("updated_at"),
        admin_id=str(updated_cafe.get("admin_id")) if updated_cafe.get("admin_id") else None
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

