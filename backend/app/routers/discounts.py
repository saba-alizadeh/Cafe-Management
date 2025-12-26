from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel
from app.database import get_database, connect_to_mongo
from app.models import OffCodeCreate, OffCodeUpdate, OffCodeResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin
from app.db_helpers import (
    get_cafe_offcodes_collection, require_cafe_access
)

router = APIRouter(prefix="/api/discounts", tags=["discounts"])


class DiscountVerifyRequest(BaseModel):
    code: str
    cafe_id: str
    total_amount: float


class DiscountVerifyResponse(BaseModel):
    valid: bool
    discount_percent: float = 0
    discount_amount: float = 0
    final_amount: float = 0
    message: str = ""


@router.get("", response_model=list[OffCodeResponse])
async def list_discount_codes(current_user: TokenData = Depends(get_current_user)):
    """Get all discount codes for the current user's café"""
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

    codes_collection = get_cafe_offcodes_collection(db, cafe_id)
    cursor = codes_collection.find({}).sort("created_at", -1)
    codes = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        codes.append(OffCodeResponse(**doc))
    return codes


@router.post("", response_model=OffCodeResponse, status_code=201)
async def create_discount_code(code: OffCodeCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new discount code for the current user's café"""
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

    codes_collection = get_cafe_offcodes_collection(db, cafe_id)
    
    # Check if code already exists in this café
    existing = await codes_collection.find_one({"code": code.code.upper()})
    if existing:
        raise HTTPException(status_code=400, detail="Discount code already exists")

    doc = code.model_dump()
    doc["code"] = doc["code"].upper()  # Store in uppercase
    doc["cafe_id"] = cafe_id  # Store café ID for reference
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
    """Update a discount code in the current user's café"""
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

    codes_collection = get_cafe_offcodes_collection(db, cafe_id)
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
    """Delete a discount code from the current user's café"""
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

    codes_collection = get_cafe_offcodes_collection(db, cafe_id)
    try:
        oid = ObjectId(code_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid code ID")

    result = await codes_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Code not found")
    return None


@router.post("/verify", response_model=DiscountVerifyResponse)
async def verify_discount_code(request: DiscountVerifyRequest):
    """Verify and apply a discount code (public endpoint for customers)"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    try:
        cafe_id = ObjectId(request.cafe_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid café ID")
    
    codes_collection = get_cafe_offcodes_collection(db, str(cafe_id))
    code_upper = request.code.upper().strip()
    
    # Find the discount code
    discount_code = await codes_collection.find_one({"code": code_upper})
    
    if not discount_code:
        return DiscountVerifyResponse(
            valid=False,
            message="کد تخفیف یافت نشد"
        )
    
    # Check if code is active
    if not discount_code.get("is_active", True):
        return DiscountVerifyResponse(
            valid=False,
            message="کد تخفیف غیرفعال است"
        )
    
    # Check expiration
    expires_at = discount_code.get("expires_at")
    if expires_at and datetime.utcnow() > expires_at:
        return DiscountVerifyResponse(
            valid=False,
            message="کد تخفیف منقضی شده است"
        )
    
    # Check max uses
    max_uses = discount_code.get("max_uses")
    current_uses = discount_code.get("current_uses", 0)
    if max_uses and current_uses >= max_uses:
        return DiscountVerifyResponse(
            valid=False,
            message="کد تخفیف به حداکثر استفاده رسیده است"
        )
    
    # Calculate discount
    discount_percent = discount_code.get("percent", 0)
    discount_amount = (request.total_amount * discount_percent) / 100
    final_amount = request.total_amount - discount_amount
    
    return DiscountVerifyResponse(
        valid=True,
        discount_percent=discount_percent,
        discount_amount=discount_amount,
        final_amount=final_amount,
        message="کد تخفیف با موفقیت اعمال شد"
    )
