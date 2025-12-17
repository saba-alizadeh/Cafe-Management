from datetime import datetime
from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user, get_password_hash
from app.database import connect_to_mongo, get_database
from app.admin_models import AdminCreate, AdminResponse
from app.models import TokenData
from app.routers.auth import _get_request_user

router = APIRouter(prefix="/api/admins", tags=["admins"])


async def _ensure_manager_or_admin(db, current_user: TokenData):
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


@router.get("", response_model=List[AdminResponse])
async def list_admins(current_user: TokenData = Depends(get_current_user)):
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

    admins_collection = db["admins"]
    admins: List[AdminResponse] = []
    async for adm in admins_collection.find({}):
        admins.append(
            AdminResponse(
                id=str(adm["_id"]),
                name=adm.get("name"),
                username=adm.get("username"),
                email=adm.get("email"),
                phone=adm.get("phone"),
                cafe_id=adm.get("cafe_id"),
                is_active=adm.get("is_active", True),
                user_id=str(adm.get("user_id")) if adm.get("user_id") else None,
                created_at=adm.get("created_at", datetime.utcnow())
            )
        )
    admins.sort(key=lambda a: a.created_at, reverse=True)
    return admins


@router.post("", response_model=AdminResponse, status_code=status.HTTP_201_CREATED)
async def create_admin(admin_data: AdminCreate, current_user: TokenData = Depends(get_current_user)):
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

    admins_collection = db["admins"]
    users_collection = db["users"]

    # Check username unique (admins collection and users)
    existing_admin = await admins_collection.find_one({"username": admin_data.username})
    existing_user = await users_collection.find_one({"username": admin_data.username})
    if existing_admin or existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )

    # Create user with role admin in users collection
    hashed_password = get_password_hash(admin_data.password)
    user_doc = {
        "username": admin_data.username,
        "password": hashed_password,
        "email": admin_data.email,
        "phone": admin_data.phone,
        "role": "admin",
        "name": admin_data.name,
        "cafe_id": admin_data.cafe_id,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    user_result = await users_collection.insert_one(user_doc)
    user_id = user_result.inserted_id

    # Create admin record
    admin_doc = {
        "user_id": user_id,
        "name": admin_data.name,
        "username": admin_data.username,
        "email": admin_data.email,
        "phone": admin_data.phone,
        "cafe_id": admin_data.cafe_id,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    admin_result = await admins_collection.insert_one(admin_doc)
    admin_id = admin_result.inserted_id

    return AdminResponse(
        id=str(admin_id),
        user_id=str(user_id),
        name=admin_data.name,
        username=admin_data.username,
        email=admin_data.email,
        phone=admin_data.phone,
        cafe_id=admin_data.cafe_id,
        is_active=True,
        created_at=admin_doc["created_at"],
    )


@router.delete("/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_admin(admin_id: str, current_user: TokenData = Depends(get_current_user)):
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

    admins_collection = db["admins"]
    users_collection = db["users"]

    try:
        adm = await admins_collection.find_one({"_id": ObjectId(admin_id)})
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid admin id")

    if not adm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    # Deactivate admin record
    await admins_collection.update_one(
        {"_id": ObjectId(admin_id)},
        {"$set": {"is_active": False}}
    )

    # Deactivate linked user
    if adm.get("user_id"):
        try:
            await users_collection.update_one(
                {"_id": adm["user_id"]},
                {"$set": {"is_active": False}}
            )
        except Exception:
            pass

    return None

