from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import (
    TableCreate, TableUpdate, TableResponse, TokenData
)
from app.auth import get_current_user
from app.routers.auth import _get_request_user
from app.db_helpers import require_cafe_access, get_cafe_tables_collection

router = APIRouter(prefix="/api/tables", tags=["tables"])




@router.get("", response_model=List[TableResponse])
async def list_tables(current_user: TokenData = Depends(get_current_user)):
    """
    List all tables for the current user's cafe.
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
    
    cafe_id = await require_cafe_access(db, current_user)
    tables_collection = get_cafe_tables_collection(db, cafe_id)
    tables: List[TableResponse] = []
    
    async for table in tables_collection.find({"is_active": {"$ne": False}}):
        tables.append(
            TableResponse(
                id=str(table["_id"]),
                name=table.get("name"),
                capacity=table.get("capacity"),
                status=table.get("status", "available"),
                cafe_id=int(cafe_id) if cafe_id else None,
                is_active=table.get("is_active", True),
                created_at=table.get("created_at", datetime.utcnow()),
                updated_at=table.get("updated_at")
            )
        )
    
    tables.sort(key=lambda t: t.created_at, reverse=True)
    return tables


@router.post("", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(
    table_data: TableCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Create a new table for the current user's cafe.
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

    cafe_id = await require_cafe_access(db, current_user)
    tables_collection = get_cafe_tables_collection(db, cafe_id)

    # Check if table name already exists for this cafe
    existing_table = await tables_collection.find_one({
        "name": table_data.name.strip(),
        "is_active": {"$ne": False}
    })
    if existing_table:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Table with name '{table_data.name}' already exists for this cafe"
        )

    # Create the table
    table_doc = {
        "name": table_data.name.strip(),
        "capacity": table_data.capacity,
        "status": table_data.status,
        "is_active": table_data.is_active,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }

    result = await tables_collection.insert_one(table_doc)
    table_id = result.inserted_id

    created_table = await tables_collection.find_one({"_id": table_id})

    return TableResponse(
        id=str(created_table["_id"]),
        name=created_table.get("name"),
        capacity=created_table.get("capacity"),
        status=created_table.get("status", "available"),
        cafe_id=int(cafe_id) if cafe_id else None,
        is_active=created_table.get("is_active", True),
        created_at=created_table.get("created_at", datetime.utcnow()),
        updated_at=created_table.get("updated_at")
    )


@router.put("/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: str,
    table_update: TableUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Update a table for the current user's cafe.
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

    cafe_id = await require_cafe_access(db, current_user)
    tables_collection = get_cafe_tables_collection(db, cafe_id)
    
    try:
        oid = ObjectId(table_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid table ID")

    # Check if table exists
    existing = await tables_collection.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=404, detail="Table not found")

    # Build update dict with only provided fields
    update_data = {}
    table_dict = table_update.model_dump(exclude_unset=True)
    
    # Check for unique constraints if updating name
    if "name" in table_dict and table_dict["name"]:
        existing_table = await tables_collection.find_one({
            "name": table_dict["name"].strip(),
            "_id": {"$ne": oid},
            "is_active": {"$ne": False}
        })
        if existing_table:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Table with name '{table_dict['name']}' already exists for this cafe"
            )
        update_data["name"] = table_dict["name"].strip()

    # Add other fields
    for field in ["capacity", "status", "is_active"]:
        if field in table_dict:
            update_data[field] = table_dict[field]

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    update_data["updated_at"] = datetime.utcnow()

    update_result = await tables_collection.update_one(
        {"_id": oid},
        {"$set": update_data}
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")

    updated = await tables_collection.find_one({"_id": oid})
    return TableResponse(
        id=str(updated["_id"]),
        name=updated.get("name"),
        capacity=updated.get("capacity"),
        status=updated.get("status", "available"),
        cafe_id=int(cafe_id) if cafe_id else None,
        is_active=updated.get("is_active", True),
        created_at=updated.get("created_at", datetime.utcnow()),
        updated_at=updated.get("updated_at")
    )


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_table(
    table_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """
    Soft delete a table (set is_active to False) for the current user's cafe.
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

    cafe_id = await require_cafe_access(db, current_user)
    tables_collection = get_cafe_tables_collection(db, cafe_id)
    
    try:
        oid = ObjectId(table_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid table ID")

    # Soft delete: set is_active to False
    update_result = await tables_collection.update_one(
        {"_id": oid},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Table not found")

    return None

