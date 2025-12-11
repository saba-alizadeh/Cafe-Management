from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import InventoryCreate, InventoryUpdate, InventoryResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user, _require_admin

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("", response_model=list[InventoryResponse])
async def list_inventory(current_user: TokenData = Depends(get_current_user)):
    """Get all inventory items"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    inventory_collection = db["inventory"]
    cursor = inventory_collection.find({}).sort("name", 1)
    items = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        items.append(InventoryResponse(**doc))
    return items


@router.post("", response_model=InventoryResponse, status_code=201)
async def create_inventory_item(item: InventoryCreate, current_user: TokenData = Depends(get_current_user)):
    """Create a new inventory item"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    inventory_collection = db["inventory"]
    
    # Check if item with same name already exists
    existing = await inventory_collection.find_one({"name": item.name})
    if existing:
        raise HTTPException(status_code=400, detail="Item with this name already exists")

    doc = item.model_dump()
    doc["created_at"] = datetime.utcnow()
    doc["updated_at"] = datetime.utcnow()
    result = await inventory_collection.insert_one(doc)
    created = await inventory_collection.find_one({"_id": result.inserted_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    return InventoryResponse(**created)


@router.put("/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: str,
    item_update: InventoryUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update an inventory item"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    inventory_collection = db["inventory"]
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    update_data = item_update.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    update_data["updated_at"] = datetime.utcnow()

    result = await inventory_collection.update_one(
        {"_id": oid},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    updated = await inventory_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return InventoryResponse(**updated)


@router.delete("/{item_id}", status_code=204)
async def delete_inventory_item(item_id: str, current_user: TokenData = Depends(get_current_user)):
    """Delete an inventory item"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")

    user = await _get_request_user(db, current_user)
    _require_admin(user)

    inventory_collection = db["inventory"]
    try:
        oid = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid item ID")

    result = await inventory_collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return None

