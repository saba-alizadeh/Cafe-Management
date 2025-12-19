from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from typing import List
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import (
    EventCreate, EventUpdate, EventResponse,
    EventSessionCreate, EventSessionUpdate, EventSessionResponse,
    TokenData
)
from app.auth import get_current_user
from app.db_helpers import (
    require_cafe_access, get_cafe_events_collection,
    get_cafe_event_sessions_collection, get_cafe_information_collection,
    get_cafe_event_images_collection
)
import base64

router = APIRouter(prefix="/api/events", tags=["events"])


@router.post("/upload-image")
async def upload_event_image(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload an event image. Returns a URL that can be stored in event records.
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
    await _ensure_cafe_has_events(db, cafe_id)

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": "event_image",
        "cafe_id": cafe_id,
        "data": image_data_url,
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await images_collection.insert_one(image_doc)
    image_id = str(result.inserted_id)
    
    # Return URL pointing to image retrieval endpoint
    return {"url": f"/api/events/image/{image_id}"}


@router.get("/image/{image_id}")
async def get_event_image(image_id: str):
    """Retrieve an event image by ID"""
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database connection not available"
            )
    
    images_collection = db["images"]
    try:
        image_oid = ObjectId(image_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image ID"
        )
    
    image_doc = await images_collection.find_one({"_id": image_oid, "type": "event_image"})
    if not image_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    from fastapi.responses import Response
    # Extract base64 data from data URL
    data_url = image_doc.get("data", "")
    if data_url.startswith("data:"):
        base64_data = data_url.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        content_type = image_doc.get("content_type", "image/jpeg")
        return Response(content=image_bytes, media_type=content_type)
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Invalid image data format"
        )


async def _ensure_cafe_has_events(db, cafe_id: str):
    """Ensure the cafe has events feature enabled"""
    cafe_info_col = get_cafe_information_collection(db, cafe_id)
    cafe_info = await cafe_info_col.find_one({})
    if not cafe_info or not cafe_info.get("has_events"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This cafe does not have events feature enabled"
        )


# Events endpoints
@router.get("", response_model=List[EventResponse])
async def list_events(current_user: TokenData = Depends(get_current_user)):
    """List all events for the current user's cafe"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    events_col = get_cafe_events_collection(db, cafe_id)
    events = []
    async for event in events_col.find({}):
        events.append(EventResponse(
            id=str(event["_id"]),
            name=event.get("name", ""),
            description=event.get("description"),
            duration_minutes=event.get("duration_minutes", 0),
            price_per_person=event.get("price_per_person", 0.0),
            image_urls=event.get("image_urls", []),
            created_at=event.get("created_at", datetime.utcnow()),
            updated_at=event.get("updated_at")
        ))
    
    return sorted(events, key=lambda x: x.created_at, reverse=True)


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    event_data: EventCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new event"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    # Validate that at least one image is provided
    if not event_data.image_urls or len(event_data.image_urls) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image is required for the event"
        )
    
    events_col = get_cafe_events_collection(db, cafe_id)
    event_images_col = get_cafe_event_images_collection(db, cafe_id)
    
    event_doc = {
        "name": event_data.name,
        "description": event_data.description,
        "duration_minutes": event_data.duration_minutes,
        "price_per_person": event_data.price_per_person,
        "image_urls": event_data.image_urls,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await events_col.insert_one(event_doc)
    event_id = str(result.inserted_id)
    
    # Store images in event_images collection
    for image_url in event_data.image_urls:
        image_doc = {
            "event_id": event_id,
            "image_url": image_url,
            "created_at": datetime.utcnow()
        }
        await event_images_col.insert_one(image_doc)
    
    return EventResponse(
        id=event_id,
        name=event_doc["name"],
        description=event_doc["description"],
        duration_minutes=event_doc["duration_minutes"],
        price_per_person=event_doc["price_per_person"],
        image_urls=event_doc["image_urls"],
        created_at=event_doc["created_at"],
        updated_at=event_doc["updated_at"]
    )


@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update an event"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    events_col = get_cafe_events_collection(db, cafe_id)
    
    try:
        event_oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID"
        )
    
    existing = await events_col.find_one({"_id": event_oid})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    update_data = {}
    if event_data.name is not None:
        update_data["name"] = event_data.name
    if event_data.description is not None:
        update_data["description"] = event_data.description
    if event_data.duration_minutes is not None:
        update_data["duration_minutes"] = event_data.duration_minutes
    if event_data.price_per_person is not None:
        update_data["price_per_person"] = event_data.price_per_person
    
    # Handle image updates
    if event_data.image_urls is not None:
        if len(event_data.image_urls) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one image is required for the event"
            )
        update_data["image_urls"] = event_data.image_urls
        # Update images in event_images collection
        event_images_col = get_cafe_event_images_collection(db, cafe_id)
        # Remove old images
        await event_images_col.delete_many({"event_id": event_id})
        # Add new images
        for image_url in event_data.image_urls:
            image_doc = {
                "event_id": event_id,
                "image_url": image_url,
                "created_at": datetime.utcnow()
            }
            await event_images_col.insert_one(image_doc)
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await events_col.update_one(
            {"_id": event_oid},
            {"$set": update_data}
        )
    
    updated = await events_col.find_one({"_id": event_oid})
    return EventResponse(
        id=str(updated["_id"]),
        name=updated["name"],
        description=updated.get("description"),
        duration_minutes=updated["duration_minutes"],
        price_per_person=updated["price_per_person"],
        image_urls=updated.get("image_urls", []),
        created_at=updated.get("created_at", datetime.utcnow()),
        updated_at=updated.get("updated_at")
    )


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete an event"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    events_col = get_cafe_events_collection(db, cafe_id)
    
    try:
        event_oid = ObjectId(event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID"
        )
    
    result = await events_col.delete_one({"_id": event_oid})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )


# Event Sessions endpoints
@router.get("/sessions", response_model=List[EventSessionResponse])
async def list_event_sessions(current_user: TokenData = Depends(get_current_user)):
    """List all event sessions for the current user's cafe"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    sessions_col = get_cafe_event_sessions_collection(db, cafe_id)
    sessions = []
    async for session in sessions_col.find({}):
        sessions.append(EventSessionResponse(
            id=str(session["_id"]),
            event_id=session.get("event_id", ""),
            session_date=session.get("session_date", ""),
            start_time=session.get("start_time", ""),
            end_time=session.get("end_time"),
            available_spots=session.get("available_spots", 0),
            price_per_person=session.get("price_per_person"),
            created_at=session.get("created_at", datetime.utcnow()),
            updated_at=session.get("updated_at")
        ))
    
    # Sort by date and time
    sessions.sort(key=lambda x: (x.session_date, x.start_time))
    return sessions


@router.post("/sessions", response_model=EventSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_event_session(
    session_data: EventSessionCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new event session"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    # Verify event exists
    events_col = get_cafe_events_collection(db, cafe_id)
    try:
        event_oid = ObjectId(session_data.event_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid event ID"
        )
    
    event = await events_col.find_one({"_id": event_oid})
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Calculate end_time if not provided
    end_time = session_data.end_time
    if not end_time:
        from datetime import timedelta
        start_parts = session_data.start_time.split(":")
        start_hour = int(start_parts[0])
        start_minute = int(start_parts[1])
        duration = event.get("duration_minutes", 0)
        end_minute = (start_minute + duration) % 60
        end_hour = start_hour + (start_minute + duration) // 60
        end_time = f"{end_hour:02d}:{end_minute:02d}"
    
    # Use event's default price if not provided
    price_per_person = session_data.price_per_person
    if price_per_person is None:
        price_per_person = event.get("price_per_person", 0.0)
    
    sessions_col = get_cafe_event_sessions_collection(db, cafe_id)
    session_doc = {
        "event_id": session_data.event_id,
        "session_date": session_data.session_date,
        "start_time": session_data.start_time,
        "end_time": end_time,
        "available_spots": session_data.available_spots,
        "price_per_person": price_per_person,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await sessions_col.insert_one(session_doc)
    
    return EventSessionResponse(
        id=str(result.inserted_id),
        event_id=session_doc["event_id"],
        session_date=session_doc["session_date"],
        start_time=session_doc["start_time"],
        end_time=session_doc["end_time"],
        available_spots=session_doc["available_spots"],
        price_per_person=session_doc["price_per_person"],
        created_at=session_doc["created_at"],
        updated_at=session_doc["updated_at"]
    )


@router.put("/sessions/{session_id}", response_model=EventSessionResponse)
async def update_event_session(
    session_id: str,
    session_data: EventSessionUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update an event session"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    sessions_col = get_cafe_event_sessions_collection(db, cafe_id)
    
    try:
        session_oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID"
        )
    
    existing = await sessions_col.find_one({"_id": session_oid})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event session not found"
        )
    
    update_data = {}
    if session_data.event_id is not None:
        # Verify event exists
        events_col = get_cafe_events_collection(db, cafe_id)
        try:
            event_oid = ObjectId(session_data.event_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid event ID"
            )
        event = await events_col.find_one({"_id": event_oid})
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        update_data["event_id"] = session_data.event_id
    
    if session_data.session_date is not None:
        update_data["session_date"] = session_data.session_date
    if session_data.start_time is not None:
        update_data["start_time"] = session_data.start_time
    if session_data.end_time is not None:
        update_data["end_time"] = session_data.end_time
    if session_data.available_spots is not None:
        update_data["available_spots"] = session_data.available_spots
    if session_data.price_per_person is not None:
        update_data["price_per_person"] = session_data.price_per_person
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await sessions_col.update_one(
            {"_id": session_oid},
            {"$set": update_data}
        )
    
    updated = await sessions_col.find_one({"_id": session_oid})
    return EventSessionResponse(
        id=str(updated["_id"]),
        event_id=updated.get("event_id", ""),
        session_date=updated.get("session_date", ""),
        start_time=updated.get("start_time", ""),
        end_time=updated.get("end_time"),
        available_spots=updated.get("available_spots", 0),
        price_per_person=updated.get("price_per_person"),
        created_at=updated.get("created_at", datetime.utcnow()),
        updated_at=updated.get("updated_at")
    )


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event_session(
    session_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete an event session"""
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
    await _ensure_cafe_has_events(db, cafe_id)
    
    sessions_col = get_cafe_event_sessions_collection(db, cafe_id)
    
    try:
        session_oid = ObjectId(session_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid session ID"
        )
    
    result = await sessions_col.delete_one({"_id": session_oid})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event session not found"
        )

