from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from core.mongo_helper import mongo_db
from modules.profiles.routes import router as profiles_router
from modules.auth.routes import router as auth_router
from modules.bookings.routes import router as bookings_router
from modules.owners.routes import router as owners_router
from modules.availability.routes import router as availability_router

# Load environment variables
load_dotenv()

app = FastAPI(title="Booking App API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
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

@app.get("/")
async def root():
    return {"message": "Booking App API"}

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
    uvicorn.run(app, host="0.0.0.0", port=8000)