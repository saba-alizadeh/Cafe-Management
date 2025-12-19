from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.config import settings
from app.auth import get_password_hash
from app.db_helpers import (
    get_persons_admins_collection, get_persons_managers_collection, get_user_from_persons
)


DEFAULT_USERS = [
    {
        "username": settings.default_admin_username,
        "password": settings.default_admin_password,
        "role": "admin",
        "name": "Default Admin",
    },
    {
        "username": settings.default_manager_username,
        "password": settings.default_manager_password,
        "role": "manager",
        "name": "Default Manager",
    },
]


async def ensure_default_users():
    """
    Create default admin/manager users if they do not exist.
    Uses the new persons structure: admins go to persons_admins, managers go to persons_managers.
    Runs on startup after MongoDB connection.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            print("Could not connect to MongoDB; default users were not ensured.")
            return

    for user_info in DEFAULT_USERS:
        username = user_info["username"]
        role = user_info["role"]
        
        # Search across all persons collections to see if user already exists
        existing, collection_name = await get_user_from_persons(db, username=username)

        if existing:
            # Ensure password exists; if missing, set it
            if not existing.get("password"):
                hashed = get_password_hash(user_info["password"])
                # Get the appropriate collection based on where user was found
                if role == "admin":
                    col = get_persons_admins_collection(db)
                elif role == "manager":
                    col = get_persons_managers_collection(db)
                else:
                    continue
                
                await col.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"password": hashed}}
                )
                print(f"Updated missing password for user '{username}'.")
            continue

        # User doesn't exist, create in appropriate collection
        hashed_password = get_password_hash(user_info["password"])
        doc = {
            "username": username,
            "password": hashed_password,
            "role": role,
            "name": user_info["name"],
            "is_active": True,
            "created_at": datetime.utcnow(),
        }
        
        if role == "admin":
            collection = get_persons_admins_collection(db)
        elif role == "manager":
            collection = get_persons_managers_collection(db)
        else:
            print(f"Skipping user '{username}' with unknown role '{role}'.")
            continue
        
        await collection.insert_one(doc)
        print(f"Created default {role} user '{username}' in persons_{role}s collection.")

