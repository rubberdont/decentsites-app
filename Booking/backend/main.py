from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI(title="Booking App API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Service(BaseModel):
    id: str
    title: str
    description: str
    price: float
    image_url: Optional[str] = None

class BusinessProfile(BaseModel):
    id: str
    name: str
    description: str
    image_url: Optional[str] = None
    services: List[Service] = []

# In-memory storage (in production, use a database)
business_profiles = {}
services_db = {}

@app.get("/")
async def root():
    return {"message": "Booking App API"}

@app.get("/profiles/{profile_id}", response_model=BusinessProfile)
async def get_profile(profile_id: str):
    if profile_id not in business_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    return business_profiles[profile_id]

@app.post("/profiles", response_model=BusinessProfile)
async def create_profile(profile: BusinessProfile):
    if not profile.id:
        profile.id = str(uuid.uuid4())
    business_profiles[profile.id] = profile
    return profile

@app.put("/profiles/{profile_id}", response_model=BusinessProfile)
async def update_profile(profile_id: str, profile: BusinessProfile):
    if profile_id not in business_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.id = profile_id
    business_profiles[profile_id] = profile
    return profile

@app.get("/profiles/{profile_id}/services", response_model=List[Service])
async def get_services(profile_id: str):
    if profile_id not in business_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    return business_profiles[profile_id].services

@app.post("/profiles/{profile_id}/services", response_model=Service)
async def create_service(profile_id: str, service: Service):
    if profile_id not in business_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if not service.id:
        service.id = str(uuid.uuid4())
    
    business_profiles[profile_id].services.append(service)
    services_db[service.id] = service
    return service

@app.put("/profiles/{profile_id}/services/{service_id}", response_model=Service)
async def update_service(profile_id: str, service_id: str, service: Service):
    if profile_id not in business_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = business_profiles[profile_id]
    service_index = next((i for i, s in enumerate(profile.services) if s.id == service_id), None)
    
    if service_index is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    service.id = service_id
    profile.services[service_index] = service
    services_db[service_id] = service
    return service

@app.delete("/profiles/{profile_id}/services/{service_id}")
async def delete_service(profile_id: str, service_id: str):
    if profile_id not in business_profiles:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile = business_profiles[profile_id]
    service_index = next((i for i, s in enumerate(profile.services) if s.id == service_id), None)
    
    if service_index is None:
        raise HTTPException(status_code=404, detail="Service not found")
    
    profile.services.pop(service_index)
    if service_id in services_db:
        del services_db[service_id]
    
    return {"message": "Service deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)