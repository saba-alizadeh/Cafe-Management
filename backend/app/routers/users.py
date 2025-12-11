from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from app.database import get_database, connect_to_mongo
from app.models import UserResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
async def list_users(current_user: TokenData = Depends(get_current_user)):
    """Get all users (admin only)"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    users_collection = db["users"]
    cursor = users_collection.find({}).sort("created_at", -1)
    users = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        users.append(UserResponse(**doc))
    return users

