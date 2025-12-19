from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import RuleCreate, RuleUpdate, RuleResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin
from app.db_helpers import (
    get_cafe_rules_collection, require_cafe_access
)

router = APIRouter(prefix="/api/rules", tags=["rules"])


@router.get("", response_model=list[RuleResponse])
async def list_rules(current_user: TokenData = Depends(get_current_user)):
    """Get all rules for the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    rules_collection = get_cafe_rules_collection(db, cafe_id)
    cursor = rules_collection.find({}).sort("created_at", -1)
    rules = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        rules.append(RuleResponse(**doc))
    return rules


@router.post("", response_model=RuleResponse, status_code=201)
async def create_rule(payload: RuleCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new rule for the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    rules_collection = get_cafe_rules_collection(db, cafe_id)
    doc = payload.model_dump()
    doc["cafe_id"] = cafe_id  # Store café ID for reference
    doc["created_at"] = datetime.utcnow()
    result = await rules_collection.insert_one(doc)
    created = await rules_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return RuleResponse(**created)


@router.put("/{rule_id}", response_model=RuleResponse)
async def update_rule(rule_id: str, payload: RuleUpdate, current_user: TokenData = Depends(get_current_user)):
    """Update a rule in the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    rules_collection = get_cafe_rules_collection(db, cafe_id)
    try:
        oid = ObjectId(rule_id)
    except Exception:
        raise HTTPException(status_code=400, detail="شناسه قانون نامعتبر است.")

    update_data = payload.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="فیلدی برای بروزرسانی ارسال نشده است.")

    result = await rules_collection.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="قانون یافت نشد.")

    updated = await rules_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return RuleResponse(**updated)


@router.delete("/{rule_id}", status_code=204)
async def delete_rule(rule_id: str, current_user: TokenData = Depends(get_current_user)):
    """Delete a rule from the current user's café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)
    
    # Get café ID and enforce isolation
    cafe_id = await require_cafe_access(db, current_user)

    rules_collection = get_cafe_rules_collection(db, cafe_id)
    try:
        oid = ObjectId(rule_id)
    except Exception:
        raise HTTPException(status_code=400, detail="شناسه قانون نامعتبر است.")

    result = await rules_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="قانون یافت نشد.")
    return None
