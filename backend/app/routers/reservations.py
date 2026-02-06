from fastapi import APIRouter, HTTPException, Depends, status, Query
from bson import ObjectId
from datetime import datetime
from typing import List, Optional
from app.database import get_database, connect_to_mongo
from app.models import (
    TableReservationCreate,
    CinemaReservationCreate,
    EventReservationCreate,
    CoworkingReservationCreate,
    ReservationResponse,
)
from app.auth import get_current_user, TokenData
from app.routers.auth import _get_request_user
from app.db_helpers import (
    get_cafe_tables_collection,
    get_cafe_movie_sessions_collection,
    get_cafe_events_collection,
    get_cafe_event_sessions_collection,
    get_cafe_coworking_tables_collection,
    get_cafe_id_for_access,
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
    reservation_type: Optional[str] = Query(
        None, description="Filter by reservation type: table, cinema, event, coworking"
    ),
    cafe_id: Optional[str] = Query(
        None,
        description="Café ID. For admin/manager/barista this limits to their café; for customers it filters their own reservations for that café.",
    ),
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Optional reservation status filter: pending, confirmed, completed, cancelled",
    ),
):
    """
    Get reservations.

    - Customers: see only their own reservations.
    - Admin/Manager/Barista: see all reservations for their café (when cafe_id is provided
      or resolvable via access helpers).
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(status_code=503, detail="Database connection not available.")
    
    user = await _get_request_user(db, current_user)
    user_id = str(user["_id"])
    role = user.get("role")
    
    reservations = []
    
    # If cafe_id is provided, get reservations from that cafe
    if cafe_id:
        cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
        reservations_collection = get_reservations_collection(db, cafe_id)

        # Admin / manager / barista can see all reservations for the café.
        query: dict = {}
        if role not in ("admin", "manager", "barista"):
            query["user_id"] = user_id

        if reservation_type:
            query["reservation_type"] = reservation_type
        if status_filter:
            query["status"] = status_filter

        async for doc in reservations_collection.find(query).sort("created_at", -1):
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            reservations.append(ReservationResponse(**doc))
    else:
        # Get reservations from all cafes for this user (customer history view).
        # Admin/manager/barista can still call this but it will only return their own reservations.
        cafes_collection = db["cafes"]
        async for cafe in cafes_collection.find({}):
            cafe_id_str = str(cafe["_id"])
            reservations_collection = get_reservations_collection(db, cafe_id_str)
            query: dict = {"user_id": user_id}
            if reservation_type:
                query["reservation_type"] = reservation_type
            if status_filter:
                query["status"] = status_filter

            async for doc in reservations_collection.find(query).sort("created_at", -1):
                doc["id"] = str(doc["_id"])
                doc.pop("_id", None)
                reservations.append(ReservationResponse(**doc))

    return sorted(reservations, key=lambda x: x.created_at, reverse=True)


@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation_status(
    reservation_id: str,
    status_update: str = Query(
        ...,
        description="New status for reservation: pending, confirmed, completed, cancelled",
    ),
    cafe_id: str = Query(..., description="Café ID for this reservation"),
    current_user: TokenData = Depends(get_current_user),
):
    """
    Update reservation status (admin / manager / barista).

    - Approve: typically set status to 'confirmed'.
    - Reject / cancel: set status to 'cancelled' which will also release the underlying
      resource (table / coworking desk / cinema seats / event spots).
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=503, detail="Database connection not available."
            )

    user = await _get_request_user(db, current_user)
    if user.get("role") not in ("admin", "manager", "barista"):
        raise HTTPException(
            status_code=403,
            detail="Only admin/manager/barista can update reservation status",
        )

    cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
    reservations_collection = get_reservations_collection(db, cafe_id)

    try:
        oid = ObjectId(reservation_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reservation ID")

    reservation_doc = await reservations_collection.find_one({"_id": oid})
    if not reservation_doc:
        raise HTTPException(status_code=404, detail="Reservation not found")

    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status_update not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
        )

    previous_status = reservation_doc.get("status")

    # If nothing changes, just return the existing document
    if previous_status == status_update:
        reservation_doc["id"] = str(reservation_doc["_id"])
        reservation_doc.pop("_id", None)
        return ReservationResponse(**reservation_doc)

    await reservations_collection.update_one(
        {"_id": oid},
        {"$set": {"status": status_update, "updated_at": datetime.utcnow()}},
    )

    # Release or occupy underlying resources when status transitions require it.
    reservation_type = reservation_doc.get("reservation_type")

    # On cancelling, free up the associated resource so other customers can book it.
    if previous_status != "cancelled" and status_update == "cancelled":
        if reservation_type == "table":
            tables_collection = get_cafe_tables_collection(db, cafe_id)
            table_id = reservation_doc.get("table_id")
            if table_id:
                try:
                    table_oid = ObjectId(table_id)
                    await tables_collection.update_one(
                        {"_id": table_oid},
                        {
                            "$set": {
                                "status": "available",
                                "updated_at": datetime.utcnow(),
                            }
                        },
                    )
                except Exception:
                    # Invalid table id stored; do not fail the whole operation
                    pass
        elif reservation_type == "coworking":
            tables_collection = get_cafe_coworking_tables_collection(db, cafe_id)
            table_id = reservation_doc.get("table_id")
            if table_id:
                try:
                    table_oid = ObjectId(table_id)
                    await tables_collection.update_one(
                        {"_id": table_oid},
                        {
                            "$set": {
                                "is_available": True,
                                "updated_at": datetime.utcnow(),
                            }
                        },
                    )
                except Exception:
                    pass
        elif reservation_type == "cinema":
            sessions_collection = get_cafe_movie_sessions_collection(db, cafe_id)
            session_id = reservation_doc.get("session_id")
            if session_id:
                try:
                    session_oid = ObjectId(session_id)
                    session = await sessions_collection.find_one({"_id": session_oid})
                    if session:
                        occupied_seats = session.get("occupied_seats", [])
                        seat_numbers = reservation_doc.get("seat_numbers") or []
                        # Remove this reservation's seats from occupied list
                        updated_occupied = [
                            s for s in occupied_seats if s not in seat_numbers
                        ]
                        available_seats = session.get("available_seats", 0) + len(
                            seat_numbers
                        )
                        await sessions_collection.update_one(
                            {"_id": session_oid},
                            {
                                "$set": {
                                    "occupied_seats": updated_occupied,
                                    "available_seats": max(0, available_seats),
                                    "updated_at": datetime.utcnow(),
                                }
                            },
                        )
                except Exception:
                    pass
        elif reservation_type == "event":
            sessions_collection = get_cafe_event_sessions_collection(db, cafe_id)
            session_id = reservation_doc.get("session_id")
            if session_id:
                try:
                    session_oid = ObjectId(session_id)
                    session = await sessions_collection.find_one({"_id": session_oid})
                    if session:
                        spots = session.get("available_spots", 0)
                        num_people = reservation_doc.get("number_of_people", 0)
                        await sessions_collection.update_one(
                            {"_id": session_oid},
                            {
                                "$set": {
                                    "available_spots": max(0, spots + num_people),
                                    "updated_at": datetime.utcnow(),
                                }
                            },
                        )
                except Exception:
                    pass

    # Optionally, if a previously pending reservation is approved (confirmed) and
    # the create endpoint was called with a 'pending' status, we could re-assert
    # the resource as occupied here. For now we rely on the create_* endpoints
    # to mark resources as reserved when the reservation is first created.

    updated = await reservations_collection.find_one({"_id": oid})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return ReservationResponse(**updated)

