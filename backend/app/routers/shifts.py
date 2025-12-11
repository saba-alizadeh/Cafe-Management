from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import ShiftSchedulingCreate, ShiftSchedulingResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin

router = APIRouter(prefix="/api/shifts", tags=["shifts"])


@router.get("", response_model=list[ShiftSchedulingResponse])
async def list_shifts(current_user: TokenData = Depends(get_current_user)):
    """Get all shifts"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    shifts_collection = db["shiftscheduling"]
    cursor = shifts_collection.find({}).sort("date", -1)
    shifts = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        shifts.append(ShiftSchedulingResponse(**doc))
    return shifts


@router.post("", response_model=ShiftSchedulingResponse, status_code=201)
async def create_shift(shift: ShiftSchedulingCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new shift"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    # Verify employee exists
    employees_collection = db["employees"]
    try:
        employee = await employees_collection.find_one({"_id": ObjectId(shift.employee_id)})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    shifts_collection = db["shiftscheduling"]
    doc = shift.model_dump()
    doc["created_at"] = datetime.utcnow()
    result = await shifts_collection.insert_one(doc)
    created = await shifts_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return ShiftSchedulingResponse(**created)


@router.delete("/{shift_id}", status_code=204)
async def delete_shift(shift_id: str, current_user: TokenData = Depends(get_current_user)):
    """Delete a shift"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    shifts_collection = db["shiftscheduling"]
    try:
        oid = ObjectId(shift_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shift ID")

    result = await shifts_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shift not found")
    return None

