from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import (
    CoworkingTableCreate, CoworkingTableUpdate, CoworkingTableResponse,
    TokenData
)
from app.auth import get_current_user
from app.db_helpers import (
    require_cafe_access, get_cafe_coworking_tables_collection,
    get_cafe_information_collection
)

router = APIRouter(prefix="/api/coworking", tags=["coworking"])


async def _ensure_cafe_has_coworking(db, cafe_id: str):
    """Ensure the cafe has co-working space feature enabled"""
    cafe_info_col = get_cafe_information_collection(db, cafe_id)
    cafe_info = await cafe_info_col.find_one({})
    if not cafe_info or not cafe_info.get("has_coworking"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This cafe does not have co-working space feature enabled"
        )


@router.get("/tables", response_model=List[CoworkingTableResponse])
async def list_coworking_tables(current_user: TokenData = Depends(get_current_user)):
    """List all co-working tables for the current user's cafe"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    cafe_id = await require_cafe_access(db, current_user)
    await _ensure_cafe_has_coworking(db, cafe_id)
    
    tables_col = get_cafe_coworking_tables_collection(db, cafe_id)
    tables = []
    async for table in tables_col.find({}):
        tables.append(CoworkingTableResponse(
            id=str(table["_id"]),
            name=table.get("name", ""),
            capacity=table.get("capacity", 1),
            is_available=table.get("is_available", True),
            amenities=table.get("amenities"),
            created_at=table.get("created_at", datetime.utcnow()),
            updated_at=table.get("updated_at")
        ))
    
    return sorted(tables, key=lambda x: x.created_at, reverse=True)


@router.post("/tables", response_model=CoworkingTableResponse, status_code=status.HTTP_201_CREATED)
async def create_coworking_table(
    table_data: CoworkingTableCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new co-working table"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    cafe_id = await require_cafe_access(db, current_user)
    await _ensure_cafe_has_coworking(db, cafe_id)
    
    tables_col = get_cafe_coworking_tables_collection(db, cafe_id)
    table_doc = {
        "name": table_data.name,
        "capacity": table_data.capacity,
        "is_available": table_data.is_available,
        "amenities": table_data.amenities,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await tables_col.insert_one(table_doc)
    table_doc["_id"] = result.inserted_id
    
    return CoworkingTableResponse(
        id=str(result.inserted_id),
        name=table_doc["name"],
        capacity=table_doc["capacity"],
        is_available=table_doc["is_available"],
        amenities=table_doc["amenities"],
        created_at=table_doc["created_at"],
        updated_at=table_doc["updated_at"]
    )


@router.put("/tables/{table_id}", response_model=CoworkingTableResponse)
async def update_coworking_table(
    table_id: str,
    table_data: CoworkingTableUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a co-working table"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    cafe_id = await require_cafe_access(db, current_user)
    await _ensure_cafe_has_coworking(db, cafe_id)
    
    tables_col = get_cafe_coworking_tables_collection(db, cafe_id)
    
    try:
        table_oid = ObjectId(table_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid table ID"
        )
    
    existing = await tables_col.find_one({"_id": table_oid})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Co-working table not found"
        )
    
    update_data = {}
    if table_data.name is not None:
        update_data["name"] = table_data.name
    if table_data.capacity is not None:
        update_data["capacity"] = table_data.capacity
    if table_data.is_available is not None:
        update_data["is_available"] = table_data.is_available
    if table_data.amenities is not None:
        update_data["amenities"] = table_data.amenities
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await tables_col.update_one(
            {"_id": table_oid},
            {"$set": update_data}
        )
    
    updated = await tables_col.find_one({"_id": table_oid})
    return CoworkingTableResponse(
        id=str(updated["_id"]),
        name=updated["name"],
        capacity=updated["capacity"],
        is_available=updated["is_available"],
        amenities=updated.get("amenities"),
        created_at=updated.get("created_at", datetime.utcnow()),
        updated_at=updated.get("updated_at")
    )


@router.delete("/tables/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coworking_table(
    table_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a co-working table"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    cafe_id = await require_cafe_access(db, current_user)
    await _ensure_cafe_has_coworking(db, cafe_id)
    
    tables_col = get_cafe_coworking_tables_collection(db, cafe_id)
    
    try:
        table_oid = ObjectId(table_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid table ID"
        )
    
    result = await tables_col.delete_one({"_id": table_oid})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Co-working table not found"
        )

