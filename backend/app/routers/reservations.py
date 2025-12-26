from fastapi import APIRouter, HTTPException, Depends, status
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from app.database import get_database, connect_to_mongo
from app.models import (
    TableReservationCreate, CinemaReservationCreate, EventReservationCreate,
    CoworkingReservationCreate, ReservationResponse
)
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user
from app.db_helpers import (
    get_cafe_tables_collection, get_cafe_movie_sessions_collection,
    get_cafe_events_collection, get_cafe_event_sessions_collection,
    get_cafe_coworking_tables_collection, get_cafe_id_for_access
)

router = APIRouter(prefix="/api/reservations", tags=["reservations"])


def get_reservations_collection(db, cafe_id: str):
    """Get reservations collection for a café"""
    return db[f"cafe_{cafe_id}_reservations"]


@router.post("/table", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_table_reservation(
    reservation: TableReservationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a table reservation and mark the table as reserved"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    cafe_id = await get_cafe_id_for_access(db, current_user, reservation.cafe_id)
    
    # Verify table exists and is available
    tables_collection = get_cafe_tables_collection(db, cafe_id)
    try:
        table_oid = ObjectId(reservation.table_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid table ID")
    
    table = await tables_collection.find_one({"_id": table_oid})
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    if table.get("status") == "reserved":
        raise HTTPException(status_code=400, detail="Table is already reserved")
    
    # Create reservation
    reservations_collection = get_reservations_collection(db, cafe_id)
    reservation_doc = {
        "user_id": str(user["_id"]),
        "reservation_type": "table",
        "cafe_id": cafe_id,
        "table_id": reservation.table_id,
        "date": reservation.date,
        "time": reservation.time,
        "number_of_people": reservation.number_of_people,
        "status": reservation.status,
        "notes": reservation.notes,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await reservations_collection.insert_one(reservation_doc)
    reservation_id = result.inserted_id
    
    # Mark table as reserved
    await tables_collection.update_one(
        {"_id": table_oid},
        {"$set": {"status": "reserved", "updated_at": datetime.utcnow()}}
    )
    
    created = await reservations_collection.find_one({"_id": reservation_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    
    return ReservationResponse(**created)


@router.post("/cinema", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_cinema_reservation(
    reservation: CinemaReservationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a cinema reservation and mark seats as reserved"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    cafe_id = await get_cafe_id_for_access(db, current_user, reservation.cafe_id)
    
    # Verify session exists
    sessions_collection = get_cafe_movie_sessions_collection(db, cafe_id)
    try:
        session_oid = ObjectId(reservation.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    session = await sessions_collection.find_one({"_id": session_oid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check if seats are available
    occupied_seats = session.get("occupied_seats", [])
    for seat in reservation.seat_numbers:
        if seat in occupied_seats:
            raise HTTPException(status_code=400, detail=f"Seat {seat} is already reserved")
    
    # Create reservation
    reservations_collection = get_reservations_collection(db, cafe_id)
    reservation_doc = {
        "user_id": str(user["_id"]),
        "reservation_type": "cinema",
        "cafe_id": cafe_id,
        "session_id": reservation.session_id,
        "date": reservation.date,
        "time": reservation.time,
        "number_of_people": reservation.number_of_people,
        "seat_numbers": reservation.seat_numbers,
        "attendee_names": reservation.attendee_names,
        "status": reservation.status,
        "notes": reservation.notes,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await reservations_collection.insert_one(reservation_doc)
    reservation_id = result.inserted_id
    
    # Mark seats as occupied
    updated_occupied = list(set(occupied_seats + reservation.seat_numbers))
    available_seats = session.get("available_seats", 0) - len(reservation.seat_numbers)
    
    await sessions_collection.update_one(
        {"_id": session_oid},
        {
            "$set": {
                "occupied_seats": updated_occupied,
                "available_seats": max(0, available_seats),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    created = await reservations_collection.find_one({"_id": reservation_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    
    return ReservationResponse(**created)


@router.post("/event", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_event_reservation(
    reservation: EventReservationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create an event reservation"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    cafe_id = await get_cafe_id_for_access(db, current_user, reservation.cafe_id)
    
    # Verify session exists and has available spots
    sessions_collection = get_cafe_event_sessions_collection(db, cafe_id)
    try:
        session_oid = ObjectId(reservation.session_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid session ID")
    
    session = await sessions_collection.find_one({"_id": session_oid})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    available_spots = session.get("available_spots", 0)
    if available_spots < reservation.number_of_people:
        raise HTTPException(status_code=400, detail="Not enough available spots")
    
    # Create reservation
    reservations_collection = get_reservations_collection(db, cafe_id)
    reservation_doc = {
        "user_id": str(user["_id"]),
        "reservation_type": "event",
        "cafe_id": cafe_id,
        "event_id": reservation.event_id,
        "session_id": reservation.session_id,
        "date": reservation.date,
        "time": reservation.time,
        "number_of_people": reservation.number_of_people,
        "attendee_names": reservation.attendee_names,
        "status": reservation.status,
        "notes": reservation.notes,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await reservations_collection.insert_one(reservation_doc)
    reservation_id = result.inserted_id
    
    # Update available spots
    await sessions_collection.update_one(
        {"_id": session_oid},
        {
            "$set": {
                "available_spots": available_spots - reservation.number_of_people,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    created = await reservations_collection.find_one({"_id": reservation_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    
    return ReservationResponse(**created)


@router.post("/coworking", response_model=ReservationResponse, status_code=status.HTTP_201_CREATED)
async def create_coworking_reservation(
    reservation: CoworkingReservationCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a coworking space reservation and mark the table as reserved"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    cafe_id = await get_cafe_id_for_access(db, current_user, reservation.cafe_id)
    
    # Verify table exists and is available
    tables_collection = get_cafe_coworking_tables_collection(db, cafe_id)
    try:
        table_oid = ObjectId(reservation.table_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid table ID")
    
    table = await tables_collection.find_one({"_id": table_oid})
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    if not table.get("is_available", True):
        raise HTTPException(status_code=400, detail="Table is not available")
    
    # Create reservation
    reservations_collection = get_reservations_collection(db, cafe_id)
    reservation_doc = {
        "user_id": str(user["_id"]),
        "reservation_type": "coworking",
        "cafe_id": cafe_id,
        "table_id": reservation.table_id,
        "date": reservation.date,
        "time": reservation.time,
        "number_of_people": reservation.number_of_people,
        "status": reservation.status,
        "notes": reservation.notes,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await reservations_collection.insert_one(reservation_doc)
    reservation_id = result.inserted_id
    
    # Mark table as unavailable
    await tables_collection.update_one(
        {"_id": table_oid},
        {"$set": {"is_available": False, "updated_at": datetime.utcnow()}}
    )
    
    created = await reservations_collection.find_one({"_id": reservation_id})
    created["id"] = str(created["_id"])
    created.pop("_id", None)
    
    return ReservationResponse(**created)


@router.get("", response_model=List[ReservationResponse])
async def get_user_reservations(
    current_user: TokenData = Depends(get_current_user),
    reservation_type: Optional[str] = None,
    cafe_id: Optional[str] = None
):
    """Get reservations for the current user"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    user_id = str(user["_id"])
    
    reservations = []
    
    # If cafe_id is provided, get reservations from that cafe
    if cafe_id:
        cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
        reservations_collection = get_reservations_collection(db, cafe_id)
        query = {"user_id": user_id}
        if reservation_type:
            query["reservation_type"] = reservation_type
        
        async for doc in reservations_collection.find(query).sort("created_at", -1):
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            reservations.append(ReservationResponse(**doc))
    else:
        # Get reservations from all cafes (for customers)
        # This requires iterating through all cafes - in production, you might want a global reservations collection
        cafes_collection = db["cafes"]
        async for cafe in cafes_collection.find({}):
            cafe_id_str = str(cafe["_id"])
            reservations_collection = get_reservations_collection(db, cafe_id_str)
            query = {"user_id": user_id}
            if reservation_type:
                query["reservation_type"] = reservation_type
            
            async for doc in reservations_collection.find(query).sort("created_at", -1):
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)
                reservations.append(ReservationResponse(**doc))
    
    return sorted(reservations, key=lambda x: x.created_at, reverse=True)

