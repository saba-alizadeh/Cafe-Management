from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.models import (
    FilmCreate, FilmUpdate, FilmResponse,
    MovieSessionCreate, MovieSessionUpdate, MovieSessionResponse,
    TokenData
)
from app.auth import get_current_user
from app.routers.auth import _get_request_user
from app.db_helpers import (
    require_cafe_access, get_cafe_films_collection,
    get_cafe_movie_sessions_collection, get_cafe_information_collection,
    get_cafe_cinema_images_collection, get_cafe_id_for_access
)
import base64

router = APIRouter(prefix="/api/cinema", tags=["cinema"])


async def _ensure_cafe_has_cinema(db, cafe_id: str):
    """Ensure the cafe has cinema feature enabled"""
    cafe_info_col = get_cafe_information_collection(db, cafe_id)
    cafe_info = await cafe_info_col.find_one({})
    if not cafe_info or not cafe_info.get("has_cinema"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This cafe does not have cinema feature enabled"
        )


@router.post("/upload-image")
async def upload_cinema_image(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user)
):
    """
    Upload a cinema image (movie poster or session image). Returns a URL that can be stored in movie session records.
    Requires café membership (admin/manager/barista only).
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
    await _ensure_cafe_has_cinema(db, cafe_id)

    # Read file contents
    contents = await file.read()
    
    # Convert to base64
    image_base64 = base64.b64encode(contents).decode('utf-8')
    image_data_url = f"data:{file.content_type};base64,{image_base64}"
    
    # Store in images collection
    images_collection = db["images"]
    image_doc = {
        "type": "cinema_image",
        "cafe_id": cafe_id,
        "data": image_data_url,
        "content_type": file.content_type,
        "created_at": datetime.utcnow()
    }
    result = await images_collection.insert_one(image_doc)
    image_id = str(result.inserted_id)
    
    # Return URL pointing to image retrieval endpoint
    return {"url": f"/api/cinema/image/{image_id}"}


@router.get("/image/{image_id}")
async def get_cinema_image(image_id: str):
    """Retrieve a cinema image by ID"""
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
    
    image_doc = await images_collection.find_one({"_id": image_oid, "type": "cinema_image"})
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


# Films endpoints
@router.get("/films", response_model=List[FilmResponse])
async def list_films(
    current_user: TokenData = Depends(get_current_user),
    cafe_id: Optional[str] = Query(None, description="Café ID (optional for customers)")
):
    """
    List all films for a café.
    - Customers can access any café by providing cafe_id
    - Admin/Manager/Barista access their own café
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
    
    cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    films_col = get_cafe_films_collection(db, cafe_id)
    films = []
    async for film in films_col.find({}):
        films.append(FilmResponse(
            id=str(film["_id"]),
            title=film.get("title", ""),
            description=film.get("description"),
            duration_minutes=film.get("duration_minutes", 0),
            genre=film.get("genre"),
            rating=film.get("rating"),
            banner_url=film.get("banner_url"),
            created_at=film.get("created_at", datetime.utcnow()),
            updated_at=film.get("updated_at")
        ))
    
    return sorted(films, key=lambda x: x.created_at, reverse=True)


@router.post("/films", response_model=FilmResponse, status_code=status.HTTP_201_CREATED)
async def create_film(
    film_data: FilmCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new film"""
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
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    films_col = get_cafe_films_collection(db, cafe_id)
    film_doc = {
        "title": film_data.title,
        "description": film_data.description,
        "duration_minutes": film_data.duration_minutes,
        "genre": film_data.genre,
        "rating": film_data.rating,
        "banner_url": film_data.banner_url,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await films_col.insert_one(film_doc)
    film_doc["_id"] = result.inserted_id
    
    return FilmResponse(
        id=str(result.inserted_id),
        title=film_doc["title"],
        description=film_doc["description"],
        duration_minutes=film_doc["duration_minutes"],
        genre=film_doc["genre"],
        rating=film_doc["rating"],
        banner_url=film_doc.get("banner_url"),
        created_at=film_doc["created_at"],
        updated_at=film_doc["updated_at"]
    )


@router.put("/films/{film_id}", response_model=FilmResponse)
async def update_film(
    film_id: str,
    film_data: FilmUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a film"""
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
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    films_col = get_cafe_films_collection(db, cafe_id)
    
    try:
        film_oid = ObjectId(film_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid film ID"
        )
    
    existing = await films_col.find_one({"_id": film_oid})
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Film not found"
        )
    
    update_data = {}
    if film_data.title is not None:
        update_data["title"] = film_data.title
    if film_data.description is not None:
        update_data["description"] = film_data.description
    if film_data.duration_minutes is not None:
        update_data["duration_minutes"] = film_data.duration_minutes
    if film_data.genre is not None:
        update_data["genre"] = film_data.genre
    if film_data.rating is not None:
        update_data["rating"] = film_data.rating
    if film_data.banner_url is not None:
        update_data["banner_url"] = film_data.banner_url
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await films_col.update_one(
            {"_id": film_oid},
            {"$set": update_data}
        )
    
    updated = await films_col.find_one({"_id": film_oid})
    return FilmResponse(
        id=str(updated["_id"]),
        title=updated["title"],
        description=updated.get("description"),
        duration_minutes=updated["duration_minutes"],
        genre=updated.get("genre"),
        rating=updated.get("rating"),
        banner_url=updated.get("banner_url"),
        created_at=updated.get("created_at", datetime.utcnow()),
        updated_at=updated.get("updated_at")
    )


@router.delete("/films/{film_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_film(
    film_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a film"""
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
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    films_col = get_cafe_films_collection(db, cafe_id)
    
    try:
        film_oid = ObjectId(film_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid film ID"
        )
    
    result = await films_col.delete_one({"_id": film_oid})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Film not found"
        )


# Movie Sessions endpoints
@router.get("/sessions", response_model=List[MovieSessionResponse])
async def list_movie_sessions(
    current_user: TokenData = Depends(get_current_user),
    cafe_id: Optional[str] = Query(None, description="Café ID (optional for customers)")
):
    """
    List all movie sessions for a café.
    - Customers can access any café by providing cafe_id
    - Admin/Manager/Barista access their own café
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
    
    cafe_id = await get_cafe_id_for_access(db, current_user, cafe_id)
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    sessions_col = get_cafe_movie_sessions_collection(db, cafe_id)
    sessions = []
    async for session in sessions_col.find({}):
        sessions.append(MovieSessionResponse(
            id=str(session["_id"]),
            film_id=session.get("film_id", ""),
            session_date=session.get("session_date", ""),
            start_time=session.get("start_time", ""),
            end_time=session.get("end_time"),
            available_seats=session.get("available_seats", 0),
            price_per_seat=session.get("price_per_seat", 0.0),
            image_url=session.get("image_url", ""),
            created_at=session.get("created_at", datetime.utcnow()),
            updated_at=session.get("updated_at")
        ))
    
    # Sort by date and time
    sessions.sort(key=lambda x: (x.session_date, x.start_time))
    return sessions


@router.post("/sessions", response_model=MovieSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_movie_session(
    session_data: MovieSessionCreate,
    current_user: TokenData = Depends(get_current_user)
):
    """Create a new movie session"""
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
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    # Verify film exists
    films_col = get_cafe_films_collection(db, cafe_id)
    try:
        film_oid = ObjectId(session_data.film_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid film ID"
        )
    
    film = await films_col.find_one({"_id": film_oid})
    if not film:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Film not found"
        )
    
    # Validate that image_url is provided
    if not session_data.image_url or not session_data.image_url.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image URL is required for the movie session"
        )
    
    # Calculate end_time if not provided
    end_time = session_data.end_time
    if not end_time:
        from datetime import timedelta
        start_parts = session_data.start_time.split(":")
        start_hour = int(start_parts[0])
        start_minute = int(start_parts[1])
        duration = film.get("duration_minutes", 0)
        end_minute = (start_minute + duration) % 60
        end_hour = start_hour + (start_minute + duration) // 60
        end_time = f"{end_hour:02d}:{end_minute:02d}"
    
    sessions_col = get_cafe_movie_sessions_collection(db, cafe_id)
    cinema_images_col = get_cafe_cinema_images_collection(db, cafe_id)
    
    session_doc = {
        "film_id": session_data.film_id,
        "session_date": session_data.session_date,
        "start_time": session_data.start_time,
        "end_time": end_time,
        "available_seats": session_data.available_seats,
        "price_per_seat": session_data.price_per_seat,
        "image_url": session_data.image_url,
        "created_at": datetime.utcnow(),
        "updated_at": None
    }
    
    result = await sessions_col.insert_one(session_doc)
    session_id = str(result.inserted_id)
    
    # Store image in cinema_images collection
    image_doc = {
        "session_id": session_id,
        "image_url": session_data.image_url,
        "created_at": datetime.utcnow()
    }
    await cinema_images_col.insert_one(image_doc)
    
    return MovieSessionResponse(
        id=session_id,
        film_id=session_doc["film_id"],
        session_date=session_doc["session_date"],
        start_time=session_doc["start_time"],
        end_time=session_doc["end_time"],
        available_seats=session_doc["available_seats"],
        price_per_seat=session_doc["price_per_seat"],
        image_url=session_doc["image_url"],
        created_at=session_doc["created_at"],
        updated_at=session_doc["updated_at"]
    )


@router.put("/sessions/{session_id}", response_model=MovieSessionResponse)
async def update_movie_session(
    session_id: str,
    session_data: MovieSessionUpdate,
    current_user: TokenData = Depends(get_current_user)
):
    """Update a movie session"""
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
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    sessions_col = get_cafe_movie_sessions_collection(db, cafe_id)
    
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
            detail="Movie session not found"
        )
    
    update_data = {}
    if session_data.film_id is not None:
        # Verify film exists
        films_col = get_cafe_films_collection(db, cafe_id)
        try:
            film_oid = ObjectId(session_data.film_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid film ID"
            )
        film = await films_col.find_one({"_id": film_oid})
        if not film:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Film not found"
            )
        update_data["film_id"] = session_data.film_id
    
    if session_data.session_date is not None:
        update_data["session_date"] = session_data.session_date
    if session_data.start_time is not None:
        update_data["start_time"] = session_data.start_time
    if session_data.end_time is not None:
        update_data["end_time"] = session_data.end_time
    if session_data.available_seats is not None:
        update_data["available_seats"] = session_data.available_seats
    if session_data.price_per_seat is not None:
        update_data["price_per_seat"] = session_data.price_per_seat
    if session_data.image_url is not None:
        if not session_data.image_url.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image URL cannot be empty"
            )
        update_data["image_url"] = session_data.image_url
        # Update image in cinema_images collection
        cinema_images_col = get_cafe_cinema_images_collection(db, cafe_id)
        # Remove old image
        await cinema_images_col.delete_many({"session_id": session_id})
        # Add new image
        image_doc = {
            "session_id": session_id,
            "image_url": session_data.image_url,
            "created_at": datetime.utcnow()
        }
        await cinema_images_col.insert_one(image_doc)
    
    if update_data:
        update_data["updated_at"] = datetime.utcnow()
        await sessions_col.update_one(
            {"_id": session_oid},
            {"$set": update_data}
        )
    
    updated = await sessions_col.find_one({"_id": session_oid})
    return MovieSessionResponse(
        id=str(updated["_id"]),
        film_id=updated.get("film_id", ""),
        session_date=updated.get("session_date", ""),
        start_time=updated.get("start_time", ""),
        end_time=updated.get("end_time"),
        available_seats=updated.get("available_seats", 0),
        price_per_seat=updated.get("price_per_seat", 0.0),
        image_url=updated.get("image_url", ""),
        created_at=updated.get("created_at", datetime.utcnow()),
        updated_at=updated.get("updated_at")
    )


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_movie_session(
    session_id: str,
    current_user: TokenData = Depends(get_current_user)
):
    """Delete a movie session"""
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
    await _ensure_cafe_has_cinema(db, cafe_id)
    
    sessions_col = get_cafe_movie_sessions_collection(db, cafe_id)
    
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
            detail="Movie session not found"
        )

