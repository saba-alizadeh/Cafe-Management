from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import ShiftSchedulingCreate, ShiftSchedulingResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin
from app.db_helpers import (
    get_cafe_shift_schedules_collection, get_cafe_employees_collection, require_cafe_access
)

router = APIRouter(prefix="/api/shifts", tags=["shifts"])


@router.get("", response_model=list[ShiftSchedulingResponse])
async def list_shifts(current_user: TokenData = Depends(get_current_user)):
    """Get all shifts for the current user's café (admin only)"""
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

    shifts_collection = get_cafe_shift_schedules_collection(db, cafe_id)
    cursor = shifts_collection.find({}).sort("date", -1)
    shifts = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        shifts.append(ShiftSchedulingResponse(**doc))
    return shifts


@router.get("/my-shifts", response_model=list[ShiftSchedulingResponse])
async def get_my_shifts(current_user: TokenData = Depends(get_current_user)):
    """Get shifts for the currently logged-in employee"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    # Get employee from employees collection
    from app.db_helpers import get_cafe_employees_collection
    
    # Search for employee by username (from token)
    employee = None
    cafe_id = None
    
    # Search across all cafes
    cafes_master = db["cafes_master"]
    async for cafe in cafes_master.find({}):
        cafe_id_str = str(cafe.get("cafe_id", ""))
        if cafe_id_str:
            employees_col = get_cafe_employees_collection(db, cafe_id_str)
            # Try to find employee by username or user_id
            found_employee = None
            if current_user.username:
                found_employee = await employees_col.find_one({"username": current_user.username})
            if not found_employee and current_user.user_id:
                try:
                    found_employee = await employees_col.find_one({"_id": ObjectId(current_user.user_id)})
                except:
                    pass
            
            if found_employee:
                employee = found_employee
                cafe_id = cafe_id_str
                break
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Get shifts for this employee
    shifts_collection = get_cafe_shift_schedules_collection(db, cafe_id)
    employee_id = str(employee["_id"])
    cursor = shifts_collection.find({"employee_id": employee_id}).sort("date", -1)
    shifts = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        shifts.append(ShiftSchedulingResponse(**doc))
    return shifts


@router.post("", response_model=ShiftSchedulingResponse, status_code=201)
async def create_shift(shift: ShiftSchedulingCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new shift for an employee in the current user's café"""
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

    # Verify employee exists in this café
    employees_collection = get_cafe_employees_collection(db, cafe_id)
    try:
        employee = await employees_collection.find_one({"_id": ObjectId(shift.employee_id)})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid employee ID")

    shifts_collection = get_cafe_shift_schedules_collection(db, cafe_id)
    doc = shift.model_dump()
    doc["cafe_id"] = cafe_id  # Store café ID for reference
    doc["created_at"] = datetime.utcnow()
    result = await shifts_collection.insert_one(doc)
    created = await shifts_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return ShiftSchedulingResponse(**created)


@router.delete("/{shift_id}", status_code=204)
async def delete_shift(shift_id: str, current_user: TokenData = Depends(get_current_user)):
    """Delete a shift from the current user's café"""
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

    shifts_collection = get_cafe_shift_schedules_collection(db, cafe_id)
    try:
        oid = ObjectId(shift_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid shift ID")

    result = await shifts_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Shift not found")
    return None
