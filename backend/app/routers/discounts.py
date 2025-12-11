from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import OffCodeCreate, OffCodeUpdate, OffCodeResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin

router = APIRouter(prefix="/api/discounts", tags=["discounts"])


@router.get("", response_model=list[OffCodeResponse])
async def list_discount_codes(current_user: TokenData = Depends(get_current_user)):
    """Get all discount codes"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    codes_collection = db["offcode"]
    cursor = codes_collection.find({}).sort("created_at", -1)
    codes = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        codes.append(OffCodeResponse(**doc))
    return codes


@router.post("", response_model=OffCodeResponse, status_code=201)
async def create_discount_code(code: OffCodeCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new discount code"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    codes_collection = db["offcode"]
    
    # Check if code already exists
    existing = await codes_collection.find_one({"code": code.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")

    doc = code.model_dump()
    doc["code"] = doc["code"].upper()  # Store in uppercase
    doc["created_at"] = datetime.utcnow()
    result = await codes_collection.insert_one(doc)
    created = await codes_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return OffCodeResponse(**created)


@router.put("/{code_id}", response_model=OffCodeResponse)
async def update_discount_code(
    code_id: str,
    code_update: OffCodeUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a discount code"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    codes_collection = db["offcode"]
    try:
        oid = ObjectId(code_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid code ID")

    update_data = code_update.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await codes_collection.update_one(
        {"_id": oid},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")

    updated = await codes_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return OffCodeResponse(**updated)


@router.delete("/{code_id}", status_code=204)
async def delete_discount_code(code_id: str, current_user: TokenData = Depends(get_current_user)):
    """Delete a discount code"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    codes_collection = db["offcode"]
    try:
        oid = ObjectId(code_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid code ID")

    result = await codes_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")
    return None

