from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# MongoDB client
client: AsyncIOMotorClient = None
database = None


async def connect_to_mongo():
    """Create database connection"""
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.database_name]
    print(f"Connected to MongoDB: {settings.database_name}")


async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")


def get_database():
    """Get database instance"""
    return database

