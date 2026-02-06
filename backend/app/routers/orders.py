from fastapi import APIRouter, HTTPException, Depends, Query, status
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from app.database import get_database, connect_to_mongo
from app.models import OrderCreate, OrderResponse
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user
from app.db_helpers import get_cafe_id_for_access, get_cafe_offcodes_collection

router = APIRouter(prefix="/api/orders", tags=["orders"])


def get_orders_collection(db, cafe_id: str):
    """Get orders collection for a café"""
    return db[f"cafe_{cafe_id}_orders"]


def get_reservations_collection(db, cafe_id: str):
    """Get unified reservations collection for a café (tables, cinema, events, coworking, orders)."""
    return db[f"cafe_{cafe_id}_reservations"]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: OrderCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new order (for products, custom drinks, etc.)"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    cafe_id = await get_cafe_id_for_access(db, current_user, order.cafe_id)
    
    # If discount code is provided, verify and update usage count
    if order.discount_code:
        codes_collection = get_cafe_offcodes_collection(db, cafe_id)
        code_upper = order.discount_code.upper().strip()
        discount_code = await codes_collection.find_one({"code": code_upper})
        
        if discount_code:
            # Increment usage count
            current_uses = discount_code.get("current_uses", 0)
            await codes_collection.update_one(
                {"code": code_upper},
                {"$set": {"current_uses": current_uses + 1}}
            )
    
    # Create order
    orders_collection = get_orders_collection(db, cafe_id)
    order_doc = {
        "user_id": str(user["_id"]),
        "cafe_id": cafe_id,
        "items": [item.model_dump() for item in order.items],
        "customer_name": order.customer_name,
        "customer_phone": order.customer_phone,
        "table_number": order.table_number,
        "discount_code": order.discount_code,
        "discount_percent": order.discount_percent,
        "discount_amount": order.discount_amount,
        "subtotal": order.subtotal,
        "total": order.total,
        "notes": order.notes,
        "status": "pending",
        "created_at": datetime.utcnow(),
        "updated_at": None,
    }

    result = await orders_collection.insert_one(order_doc)
    order_id = result.inserted_id

    created = await orders_collection.find_one({"_id": order_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)

    # Also store a unified reservation record so all reservations (including food & drinks)
    # are visible through the reservations collection used by admin/barista panels.
    reservations_collection = get_reservations_collection(db, cafe_id)
    reservation_doc = {
        "user_id": str(user["_id"]),
        "reservation_type": "order",
        "cafe_id": cafe_id,
        # Use order creation timestamp as logical reservation date/time
        "date": created["created_at"].strftime("%Y-%m-%d"),
        "time": created["created_at"].strftime("%H:%M"),
        # For orders we don't track number of people explicitly; treat each order as 1 "party"
        "number_of_people": 1,
        "status": created["status"],
        "notes": created.get("notes"),
        "order_id": created["id"],
        "items": created.get("items", []),
        "created_at": created["created_at"],
        "updated_at": created.get("updated_at"),
    }
    await reservations_collection.insert_one(reservation_doc)

    return OrderResponse(**created)


@router.get("", response_model=List[OrderResponse])
async def get_orders(
    current_user: TokenData = Depends(get_current_user),
    cafe_id: Optional[str] = Query(None, description="Café ID (optional)")
):
    """Get orders for the current user or café"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    user_id = str(user["_id"])
    
    orders = []
    
    # If cafe_id is provided, get orders from that cafe
    if cafe_id:
        cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
        orders_collection = get_orders_collection(db, cafe_id)
        
        # Admin/Manager can see all orders, customers see only their own
        query = {}
        if user.get("role") not in ["admin", "manager"]:
            query["user_id"] = user_id
        
        async for doc in orders_collection.find(query).sort("created_at", -1):
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            orders.append(OrderResponse(**doc))
    else:
        # Get orders from all cafes for the user
        cafes_collection = db["cafes"]
        async for cafe in cafes_collection.find({}):
            cafe_id_str = str(cafe["_id"])
            orders_collection = get_orders_collection(db, cafe_id_str)
            
            query = {"user_id": user_id}
            async for doc in orders_collection.find(query).sort("created_at", -1):
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)
                orders.append(OrderResponse(**doc))
    
    return sorted(orders, key=lambda x: x.created_at, reverse=True)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    status_update: str = Query(..., description="New status: pending, confirmed, preparing, ready, completed, cancelled"),
    cafe_id: str = Query(..., description="Café ID"),
    current_user: TokenData = Depends(get_current_user)
):
    """Update order status (for admin/manager)"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    if user.get("role") not in ["admin", "manager", "barista"]:
        raise HTTPException(status_code=403, detail="Only admin/manager/barista can update order status")
    
    cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
    orders_collection = get_orders_collection(db, cafe_id)
    
    try:
        oid = ObjectId(order_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order ID")
    
    valid_statuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]
    if status_update not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
    
    result = await orders_collection.update_one(
        {"_id": oid},
        {"$set": {"status": status_update, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    updated = await orders_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    
    return OrderResponse(**updated)

