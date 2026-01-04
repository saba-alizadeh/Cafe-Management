from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database import connect_to_mongo, close_mongo_connection
from app.seed_defaults import ensure_default_users
from app.routers import auth, shifts, inventory, discounts, products, users, rewards, rules, cafes, admins, tables, cinema, coworking, events, reservations, orders

app = FastAPI(
    title="Cafe Management API",
    description="Backend API for Cafe Management System",
    version="1.0.0"
)

# CORS middleware - Allow all origins in development for easier debugging
# In production, restrict to specific domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins - change to specific domains in production
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(shifts.router)
app.include_router(inventory.router)
app.include_router(discounts.router)
app.include_router(products.router)
app.include_router(users.router)
app.include_router(rewards.router)
app.include_router(rules.router)
app.include_router(cafes.router)
app.include_router(admins.router)
app.include_router(tables.router)
app.include_router(cinema.router)
app.include_router(coworking.router)
app.include_router(events.router)
app.include_router(reservations.router)
app.include_router(orders.router)

# Static files (for profile images and other assets)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await ensure_default_users()


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


@app.get("/")
async def root():
    return {
        "message": "Welcome to Cafe Management API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

