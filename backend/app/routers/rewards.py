from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import RewardCreate, RewardResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


@router.get("", response_model=list[RewardResponse])
async def list_rewards(current_user: TokenData = Depends(get_current_user)):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    rewards_collection = db["rewards"]
    cursor = rewards_collection.find({}).sort("created_at", -1)
    rewards = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        rewards.append(RewardResponse(**doc))
    return rewards


@router.post("", response_model=RewardResponse, status_code=201)
async def create_reward(payload: RewardCreate, current_user: TokenData = Depends(get_current_user)):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    # Validate employee exists
    employees_collection = db["employees"]
    try:
        oid = ObjectId(payload.employee_id)
    except Exception:
        raise HTTPException(status_code=400, detail="شناسه کارمند نامعتبر است.")
    employee = await employees_collection.find_one({"_id": oid})
    if not employee:
        raise HTTPException(status_code=404, detail="کارمند یافت نشد.")

    rewards_collection = db["rewards"]
    doc = payload.model_dump()
    doc["employee_id"] = payload.employee_id
    doc["created_at"] = datetime.utcnow()
    result = await rewards_collection.insert_one(doc)
    created = await rewards_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return RewardResponse(**created)


@router.delete("/{reward_id}", status_code=204)
async def delete_reward(reward_id: str, current_user: TokenData = Depends(get_current_user)):
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    rewards_collection = db["rewards"]
    try:
        oid = ObjectId(reward_id)
    except Exception:
        raise HTTPException(status_code=400, detail="شناسه پاداش/جریمه نامعتبر است.")

    result = await rewards_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="رکورد یافت نشد.")
    return None

