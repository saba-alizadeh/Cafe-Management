from datetime import datetime
from app.database import get_database, connect_to_mongo
from app.config import settings
from app.auth import get_password_hash


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
    Runs on startup after MongoDB connection.
    """
    db = get_database()
    if db is None:
        await connect_to_mongo()
        db = get_database()
        if db is None:
            print("Could not connect to MongoDB; default users were not ensured.")
            return

    users_collection = db["users"]

    for user_info in DEFAULT_USERS:
        username = user_info["username"]
        existing = await users_collection.find_one({"username": username})

        if existing:
            # Ensure password exists; if missing, set it
            if not existing.get("password"):
                hashed = get_password_hash(user_info["password"])
                await users_collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": {"password": hashed}}
                )
                print(f"Updated missing password for user '{username}'.")
            continue

        hashed_password = get_password_hash(user_info["password"])
        doc = {
            "username": username,
            "password": hashed_password,
            "role": user_info["role"],
            "name": user_info["name"],
            "is_active": True,
            "created_at": datetime.utcnow(),
        }
        await users_collection.insert_one(doc)
        print(f"Created default {user_info['role']} user '{username}'.")

