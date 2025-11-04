from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from core.mongo_helper import mongo_db
from modules.profiles.routes import router as profiles_router
from modules.auth.routes import router as auth_router
from modules.bookings.routes import router as bookings_router

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

@app.get("/")
async def root():
    return {"message": "Booking App API"}

@app.on_event("startup")
async def startup_db_client():
    """Initialize MongoDB connection on startup."""
    try:
        mongo_db.connect()
        print("✓ Connected to MongoDB")
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