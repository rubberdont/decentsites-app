# Load environment variables FIRST, before any other imports
from dotenv import load_dotenv
load_dotenv()

import os
import re
from fastapi import FastAPI
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from core.mongo_helper import mongo_db
from modules.profiles.routes import router as profiles_router
from modules.auth.routes import router as auth_router
from modules.bookings.routes import router as bookings_router
from modules.owners.routes import router as owners_router
from modules.availability.routes import router as availability_router
from modules.admin.routes import router as admin_router
from modules.superadmin.routes import router as superadmin_router
from modules.landing.routes import router as landing_router

app = FastAPI(title="Booking App API", version="1.0.0")

# Get static origins from env, plus regex for Codespaces
static_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:1401,http://localhost:1302")
static_origins = [o.strip() for o in static_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=static_origins,
    allow_origin_regex=r"https://.*\.github\.dev",  # Match any Codespace preview URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(profiles_router)
app.include_router(bookings_router)
app.include_router(owners_router)
app.include_router(availability_router)
app.include_router(admin_router)
app.include_router(superadmin_router)
app.include_router(landing_router)

@app.get("/")
async def root():
    return {"message": "Booking App API"}

@app.get("/server-time")
async def get_server_time():
    """Return current server time (UTC) for client-side validation."""
    return {"server_time": datetime.utcnow().isoformat() + "Z"}

@app.on_event("startup")
async def startup_db_client():
    """Initialize MongoDB connection and create indexes on startup."""
    try:
        mongo_db.connect()
        print("✓ Connected to MongoDB")
        
        # Create database indexes
        db = mongo_db.get_database()
        
        # Users indexes
        db.users.create_index("username", unique=True)
        db.users.create_index("email")
        print("✓ Created users indexes")
        
        # Bookings indexes
        db.bookings.create_index("booking_ref", unique=True)
        db.bookings.create_index("user_id")
        db.bookings.create_index("profile_id")
        db.bookings.create_index("booking_date")
        db.bookings.create_index([("profile_id", 1), ("booking_date", 1)])
        print("✓ Created bookings indexes")
        
        # Profiles indexes
        db.profiles.create_index("owner_id")
        db.profiles.create_index([("name", "text"), ("description", "text")])
        print("✓ Created profiles indexes")
        
        # Availability slots indexes
        db.availability_slots.create_index([("profile_id", 1), ("date", 1)])
        print("✓ Created availability_slots indexes")
        
        # Reviews indexes
        db.reviews.create_index("profile_id")
        db.reviews.create_index("booking_id", unique=True)
        print("✓ Created reviews indexes")
        
        # Blocked customers indexes
        db.blocked_customers.create_index([("profile_id", 1), ("customer_email", 1)], unique=True)
        db.blocked_customers.create_index("profile_id")
        db.blocked_customers.create_index("customer_email")
        db.blocked_customers.create_index("blocked_at")
        print("✓ Created blocked_customers indexes")
        
        # Customer notes indexes
        db.customer_notes.create_index([("profile_id", 1), ("customer_email", 1)], unique=True)
        db.customer_notes.create_index("profile_id")
        db.customer_notes.create_index("customer_email")
        print("✓ Created customer_notes indexes")
        
        # Activity logs indexes
        db.activity_logs.create_index("profile_id")
        db.activity_logs.create_index("admin_id")
        db.activity_logs.create_index("action_type")
        db.activity_logs.create_index("created_at")
        db.activity_logs.create_index([("profile_id", 1), ("created_at", -1)])
        print("✓ Created activity_logs indexes")
        
        # Booking notes indexes
        db.booking_notes.create_index("booking_id", unique=True)
        db.booking_notes.create_index("profile_id")
        print("✓ Created booking_notes indexes")
        
        # Landing configs indexes
        db.landing_configs.create_index("owner_id", unique=True)
        db.landing_configs.create_index("is_published")
        print("✓ Created landing_configs indexes")
        
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close MongoDB connection on shutdown."""
    mongo_db.disconnect()
    print("✓ Disconnected from MongoDB")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=1301)
