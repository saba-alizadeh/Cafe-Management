"""
Database helper functions for the new hierarchical structure.

Structure:
- persons/
  - users (regular users, excluding admins and managers)
  - admins (admin user information)
  - managers (manager user information)
- cafes/
  - {cafe_id}/
    - information (café details)
    - employees (employees for that café)
    - inventory (inventory for that café)
    - offcodes (discount codes for that café)
    - products (products for that café)
    - rewards (penalty/incentive records)
    - rules (rules for that café)
    - shift_schedules (shift schedules for that café)
    - tables (table information for that café)
    - product_images (images for products)
    - event_images (images for events)
    - cinema_images (images for cinema/movies)
    - coworking_tables (co-working space tables)
    - films (cinema films)
    - movie_sessions (cinema movie sessions)
    - events (events)
    - event_sessions (event sessions)
"""
from app.database import get_database
from app.models import TokenData


def get_persons_users_collection(db):
    """Get the persons/users collection"""
    return db["persons_users"]


def get_persons_admins_collection(db):
    """Get the persons/admins collection"""
    return db["persons_admins"]


def get_persons_managers_collection(db):
    """Get the persons/managers collection"""
    return db["persons_managers"]


def get_cafe_information_collection(db, cafe_id: str):
    """Get the information collection for a specific café"""
    return db[f"cafes_{cafe_id}_information"]


def get_cafe_employees_collection(db, cafe_id: str):
    """Get the employees collection for a specific café"""
    return db[f"cafes_{cafe_id}_employees"]


def get_cafe_inventory_collection(db, cafe_id: str):
    """Get the inventory collection for a specific café"""
    return db[f"cafes_{cafe_id}_inventory"]


def get_cafe_offcodes_collection(db, cafe_id: str):
    """Get the offcodes collection for a specific café"""
    return db[f"cafes_{cafe_id}_offcodes"]


def get_cafe_products_collection(db, cafe_id: str):
    """Get the products collection for a specific café"""
    return db[f"cafes_{cafe_id}_products"]


def get_cafe_rewards_collection(db, cafe_id: str):
    """Get the rewards collection for a specific café"""
    return db[f"cafes_{cafe_id}_rewards"]


def get_cafe_rules_collection(db, cafe_id: str):
    """Get the rules collection for a specific café"""
    return db[f"cafes_{cafe_id}_rules"]


def get_cafe_shift_schedules_collection(db, cafe_id: str):
    """Get the shift_schedules collection for a specific café"""
    return db[f"cafes_{cafe_id}_shift_schedules"]


def get_cafe_films_collection(db, cafe_id: str):
    """Get the films collection for a specific café"""
    return db[f"cafes_{cafe_id}_films"]


def get_cafe_movie_sessions_collection(db, cafe_id: str):
    """Get the movie_sessions collection for a specific café"""
    return db[f"cafes_{cafe_id}_movie_sessions"]


def get_cafe_coworking_tables_collection(db, cafe_id: str):
    """Get the coworking_tables collection for a specific café"""
    return db[f"cafes_{cafe_id}_coworking_tables"]


def get_cafe_events_collection(db, cafe_id: str):
    """Get the events collection for a specific café"""
    return db[f"cafes_{cafe_id}_events"]


def get_cafe_event_sessions_collection(db, cafe_id: str):
    """Get the event_sessions collection for a specific café"""
    return db[f"cafes_{cafe_id}_event_sessions"]


def get_cafe_tables_collection(db, cafe_id: str):
    """Get the tables collection for a specific café"""
    return db[f"cafes_{cafe_id}_tables"]


def get_cafe_product_images_collection(db, cafe_id: str):
    """Get the product_images collection for a specific café"""
    return db[f"cafes_{cafe_id}_product_images"]


def get_cafe_event_images_collection(db, cafe_id: str):
    """Get the event_images collection for a specific café"""
    return db[f"cafes_{cafe_id}_event_images"]


def get_cafe_cinema_images_collection(db, cafe_id: str):
    """Get the cinema_images collection for a specific café"""
    return db[f"cafes_{cafe_id}_cinema_images"]


def get_cafe_images_collection(db, cafe_id: str):
    """Get the cafe-img collection for a specific café"""
    return db[f"cafes_{cafe_id}_cafe-img"]


def get_user_collection_by_role(db, role: str):
    """
    Get the appropriate persons collection based on user role.
    Returns the collection for users, admins, or managers.
    """
    if role == "admin":
        return get_persons_admins_collection(db)
    elif role == "manager":
        return get_persons_managers_collection(db)
    else:
        return get_persons_users_collection(db)


async def get_user_from_persons(db, user_id: str = None, username: str = None, phone: str = None):
    """
    Search for a user across all persons collections (users, admins, managers).
    Returns (user_doc, collection_name) or (None, None) if not found.
    """
    from bson import ObjectId
    
    # Search in admins
    admins_col = get_persons_admins_collection(db)
    if user_id:
        try:
            user = await admins_col.find_one({"_id": ObjectId(user_id)})
            if user:
                return user, "admins"
        except Exception:
            pass
    if username:
        user = await admins_col.find_one({"username": username})
        if user:
            return user, "admins"
    if phone:
        user = await admins_col.find_one({"phone": phone})
        if user:
            return user, "admins"
    
    # Search in managers
    managers_col = get_persons_managers_collection(db)
    if user_id:
        try:
            user = await managers_col.find_one({"_id": ObjectId(user_id)})
            if user:
                return user, "managers"
        except Exception:
            pass
    if username:
        user = await managers_col.find_one({"username": username})
        if user:
            return user, "managers"
    if phone:
        user = await managers_col.find_one({"phone": phone})
        if user:
            return user, "managers"
    
    # Search in regular users
    users_col = get_persons_users_collection(db)
    if user_id:
        try:
            user = await users_col.find_one({"_id": ObjectId(user_id)})
            if user:
                return user, "users"
        except Exception:
            pass
    if username:
        user = await users_col.find_one({"username": username})
        if user:
            return user, "users"
    if phone:
        user = await users_col.find_one({"phone": phone})
        if user:
            return user, "users"
    
    return None, None


def get_cafe_id_from_user(user_doc):
    """
    Extract cafe_id from user document.
    Returns cafe_id as string or None.
    """
    cafe_id = user_doc.get("cafe_id")
    if cafe_id is None:
        return None
    return str(cafe_id) if not isinstance(cafe_id, str) else cafe_id


async def get_user_cafe_id(db, current_user: TokenData):
    """
    Get the cafe_id for the current user.
    Returns cafe_id as string or None if user doesn't belong to a café.
    Raises HTTPException if user not found.
    """
    from fastapi import HTTPException, status
    from app.routers.auth import _get_request_user
    
    user = await _get_request_user(db, current_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return get_cafe_id_from_user(user)


async def require_cafe_access(db, current_user: TokenData):
    """
    Ensure the current user has a cafe_id and return it.
    Raises HTTPException if user doesn't belong to a café.
    This is used for admin/manager/barista operations that require café membership.
    """
    from fastapi import HTTPException, status
    
    cafe_id = await get_user_cafe_id(db, current_user)
    if cafe_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to a café to access this resource"
        )
    return cafe_id


async def get_cafe_id_for_access(db, current_user: TokenData, cafe_id_param: str = None):
    """
    Get cafe_id for accessing café resources.
    - For customers: Uses provided cafe_id_param or gets the first available café from cafes_master
    - For admin/manager/barista: Uses their own cafe_id (requires membership)
    
    This allows customers to access any café's data for making reservations.
    """
    from fastapi import HTTPException, status
    from app.routers.auth import _get_request_user
    
    # Get user to check their role
    user = await _get_request_user(db, current_user)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_role = user.get("role", "customer")
    
    # For customers, allow access to any café
    if user_role == "customer":
        if cafe_id_param:
            return str(cafe_id_param)
        # If no cafe_id provided, get the first available café from cafes_master
        cafes_master = db["cafes_master"]
        first_cafe = await cafes_master.find_one({})
        if first_cafe and first_cafe.get("cafe_id"):
            return str(first_cafe.get("cafe_id"))
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No café found. Please specify a café."
        )
    
    # For admin/manager/barista, check if they can access the requested cafe
    user_cafe_id = get_cafe_id_from_user(user)
    if user_cafe_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User must belong to a café to access this resource"
        )
    
    # If cafe_id_param is provided, verify it matches the user's cafe
    if cafe_id_param:
        if str(cafe_id_param) != str(user_cafe_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only access data for your own café"
            )
        return str(cafe_id_param)
    
    # If no cafe_id_param provided, use user's own cafe
    return str(user_cafe_id)

