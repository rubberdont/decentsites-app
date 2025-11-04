# Phase 1 Implementation Plan - Booking App Features

## Problem Statement
Extend the booking app from a profiles/services management API to a complete user-facing booking system with authentication, user management, and booking capabilities. Users should be able to register, login, browse business profiles, and create bookings with date/service selection.

## Current State

### Existing Architecture
- **Backend Framework**: FastAPI 0.117.1
- **Database**: MongoDB (via PyMongo 3.13.0)
- **Structure**: Modular with core helpers and feature modules
- **Current Modules**: 
  - `core/mongo_helper.py` - Database abstraction layer
  - `modules/profiles/` - Business profile CRUD with embedded services

### Current Data Models
```python
# Service (embedded in BusinessProfile)
class Service(BaseModel):
    id: str
    title: str
    description: str
    price: float
    image_url: Optional[str] = None

# BusinessProfile
class BusinessProfile(BaseModel):
    id: str
    name: str
    description: str
    image_url: Optional[str] = None
    services: List[Service] = []
```

### Current API Endpoints
- `GET /profiles` - List all profiles
- `GET /profiles/{profile_id}` - Get specific profile
- `POST /profiles` - Create profile
- `PUT /profiles/{profile_id}` - Update profile
- `DELETE /profiles/{profile_id}` - Delete profile
- `GET/POST/PUT/DELETE /profiles/{profile_id}/services` - Service management

### Directory Structure
```
backend/
├── core/
│   ├── __init__.py
│   └── mongo_helper.py
├── modules/
│   ├── __init__.py
│   └── profiles/
│       ├── __init__.py
│       ├── models.py
│       ├── repository.py
│       └── routes.py
├── main.py
├── requirements.txt
├── .env
└── .gitignore
```

## Proposed Changes - Phase 1

### 1. New Data Collections & Models

#### A. Users Collection
```
{
  _id: ObjectId,
  id: str (UUID),
  username: str (unique),
  name: str,
  email: Optional[str],
  password_hash: str,
  created_at: datetime,
  updated_at: datetime
}
```

#### B. Bookings Collection
```
{
  _id: ObjectId,
  id: str (UUID),
  booking_ref: str (6-8 char alphanumeric - unique),
  user_id: str,
  profile_id: str,
  service_id: Optional[str],
  booking_date: datetime,
  status: str (PENDING, CONFIRMED, REJECTED, CANCELLED),
  notes: Optional[str],
  created_at: datetime,
  updated_at: datetime
}

**Status Workflow**:
- `PENDING` - Initial status after user creates booking
- `CONFIRMED` - Business owner confirms the booking
- `REJECTED` - Business owner rejects the booking
- `CANCELLED` - User or business owner cancels the booking
```

#### C. Booking Slots (for availability management - future phase)
```
{
  _id: ObjectId,
  profile_id: str,
  date: datetime,
  available_slots: int,
  booked_slots: int,
  created_at: datetime,
  updated_at: datetime
}
```

### 2. New Modules to Create

#### A. `modules/auth/`
**Purpose**: Handle user authentication and JWT token management

**Files**:
- `models.py` - Pydantic models
  - `UserRegister(username, name, password)`
  - `UserLogin(username, password)`
  - `UserResponse(id, username, name)`
  - `TokenResponse(access_token, token_type)`
  
- `repository.py` - User database operations
  - `create_user(username, name, password_hash)`
  - `get_user_by_username(username)`
  - `get_user_by_id(user_id)`
  - `user_exists(username)`
  
- `security.py` - Password & token utilities
  - `hash_password(password)` - bcrypt hashing
  - `verify_password(password, hash)`
  - `create_access_token(user_id)` - JWT token generation
  - `decode_token(token)` - JWT token verification
  - `get_current_user(token)` - Dependency for protected routes
  
- `routes.py` - Authentication endpoints
  - `POST /auth/register` - User signup
  - `POST /auth/login` - User login (returns JWT token)
  - `GET /auth/me` - Get current user (protected)

#### B. `modules/bookings/`
**Purpose**: Handle booking creation, retrieval, and management

**Files**:
- `models.py` - Pydantic models
  - `BookingCreate(profile_id, service_id, booking_date, notes)`
  - `BookingResponse(id, booking_ref, profile_id, service_id, booking_date, status, created_at)`
  - `BookingDetail` - Enriched booking with profile & service details
  - `AvailabilityCheck(profile_id, date)` - Check available slots
  
- `repository.py` - Booking database operations
  - `create_booking(user_id, profile_id, service_id, booking_date)`
  - `get_booking_by_id(booking_id)`
  - `get_booking_by_ref(booking_ref)`
  - `get_user_bookings(user_id)`
  - `get_profile_bookings(profile_id, date)`
  - `update_booking_status(booking_id, status)`
  - `delete_booking(booking_id)`
  - `generate_booking_ref()` - Generate unique 6-8 char reference
  
- `routes.py` - Booking endpoints
  - `POST /bookings` - Create booking (protected, sets status=PENDING)
  - `GET /bookings/{booking_id}` - Get booking details (protected)
  - `GET /bookings/ref/{booking_ref}` - Get booking by reference number
  - `GET /bookings` - List user bookings (protected)
  - `PUT /bookings/{booking_id}/status` - Update booking status (protected, for business owners)
  - `PUT /bookings/{booking_id}/cancel` - Cancel booking (protected, for users and owners)
  - `GET /profiles/{profile_id}/bookings` - List profile bookings (protected, for owners)
  - `GET /profiles/{profile_id}/availability` - Check availability on date

### 3. Modified Files

#### A. `modules/profiles/models.py`
- Add `owner_id` field to BusinessProfile (required for Phase 1)
- Links profile to the user who created it
- Enables business owners to manage their profile bookings
- Migration note: Existing profiles without owner_id will need assignment

#### B. `requirements.txt`
- Add: `python-jose==3.3.0` - JWT handling
- Add: `passlib==1.7.4` - Password hashing
- Add: `bcrypt==4.1.1` - Bcrypt backend for passlib

#### C. `main.py`
- Import and register auth router
- Import and register bookings router
- Add JWT configuration

### 4. New Directory Structure (After Phase 1)
```
backend/
├── core/
│   ├── __init__.py
│   ├── mongo_helper.py
│   └── security.py              # Shared security utilities
├── modules/
│   ├── __init__.py
│   ├── profiles/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── routes.py
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── repository.py
│   │   ├── security.py
│   │   └── routes.py
│   └── bookings/
│       ├── __init__.py
│       ├── models.py
│       ├── repository.py
│       └── routes.py
├── main.py
├── requirements.txt
├── .env
└── .gitignore
```

## User Flow - Phase 1

### Flow Diagram
```
1. SIGNUP
   User provides: username, name, password
   → POST /auth/register
   → User created in DB
   → Return UserResponse

2. LOGIN
   User provides: username, password
   → POST /auth/login
   → Validate credentials
   → Generate JWT token
   → Return TokenResponse with access_token

3. BROWSE PROFILES
   User (authenticated) views list
   → GET /profiles (no auth required - public profiles)
   → Returns all BusinessProfiles

4. VIEW PROFILE
   User clicks on profile
   → GET /profiles/{profile_id}
   → Display profile with services & calendar

5. SELECT DATE & SERVICES (Frontend Calendar)
   User selects date from calendar
   → GET /profiles/{profile_id}/availability?date=2025-11-15
   → Backend checks available slots on that date
   → If profile has services, show service selection modal

6. CREATE BOOKING
   User selects date, service (if applicable), submits
   → POST /bookings with payload:
     {
       "profile_id": "...",
       "service_id": "...",
       "booking_date": "2025-11-15T14:00:00Z",
       "notes": "..."
     }
   → Backend creates booking with unique 6-8 char reference
   → Return: { booking_ref: "A1B2C3D", booking_id: "..." }

7. BOOKING CONFIRMATION
   Show popup with booking_ref
   → User can copy reference number
   → Reference used for booking lookup (GET /bookings/ref/{booking_ref})
```

## API Endpoints - Phase 1

### Authentication Endpoints
- `POST /auth/register` - User signup
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user info (protected)

### Booking Endpoints
- `POST /bookings` - Create booking (protected, status=PENDING)
- `GET /bookings/{booking_id}` - Get booking detail (protected)
- `GET /bookings/ref/{booking_ref}` - Get booking by reference (public)
- `GET /bookings` - List user bookings (protected)
- `PUT /bookings/{booking_id}/status` - Update booking status to CONFIRMED/REJECTED (protected, owner only)
- `PUT /bookings/{booking_id}/cancel` - Cancel booking (protected, sets status=CANCELLED)
- `GET /profiles/{profile_id}/bookings` - List profile bookings (protected, owner only)

### Profile Endpoints (Enhanced)
- `GET /profiles/{profile_id}/availability` - Check date availability (query param: date)
- Existing profile endpoints remain unchanged

## Key Design Decisions

1. **Authentication**: JWT tokens in Authorization header (Bearer token)
   - No session management needed
   - Stateless & scalable
   - Token stored on frontend (localStorage or httpOnly cookie preference?)

2. **Booking Reference**: 6-8 character alphanumeric codes
   - Generated using: `secrets.token_hex(3)` or similar
   - Stored in bookings collection for quick lookup
   - Unique index on booking_ref field

3. **Password Security**: bcrypt hashing via passlib
   - Never store plain text passwords
   - Use passlib context for consistent hashing

4. **User ID Format**: UUID strings (consistent with existing pattern)
   - Not MongoDB ObjectId (for API consistency)
   - Separate from MongoDB _id field

5. **Availability Model**: Simple for Phase 1
   - For Phase 1: assume unlimited slots (no explicit slot management)
   - Can query existing bookings for date to show booked times
   - Phase 2: add Booking Slots collection for capacity management

6. **Date Handling**: ISO 8601 format strings
   - Stored as datetime in MongoDB
   - Frontend sends/receives ISO format
   - Server validates date is in future

7. **Booking Status Workflow**:
   - New bookings start with status=PENDING
   - Business owners can update status to CONFIRMED or REJECTED
   - Both users and owners can CANCEL bookings
   - Status transitions:
     - PENDING → CONFIRMED (owner)
     - PENDING → REJECTED (owner)
     - PENDING → CANCELLED (user or owner)
     - CONFIRMED → CANCELLED (user or owner)

8. **Profile Ownership**: 
   - BusinessProfile requires owner_id field
   - Only profile owner can view/manage bookings for their profile
   - Only profile owner can confirm/reject bookings

## Implementation Order

1. Create `core/security.py` - JWT & password utilities
2. Create `modules/auth/` - User registration & login
3. Create `modules/bookings/` - Booking operations
4. Update `main.py` - Register new routers
5. Update `requirements.txt` - Add auth dependencies
6. Add database indexes for username & booking_ref
7. Test all endpoints

## Security Considerations

- ✅ Password hashing (bcrypt)
- ✅ JWT token validation
- ✅ Protected endpoints (require authentication)
- ✅ HTTPS recommended in production (enforced at deployment level)
- ✅ CORS already configured
- ✅ Input validation via Pydantic
- 🔄 Rate limiting - optional for Phase 2
- 🔄 Booking access control - user can only see own bookings
- 🔄 Email verification - optional for Phase 2

## Testing Endpoints

### Example: Signup & Login
```bash
# 1. Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","name":"John Doe","password":"securepass123"}'

# 2. Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"securepass123"}'

# Returns: {"access_token":"eyJ0eXAi...","token_type":"bearer"}

# 3. Get current user
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer eyJ0eXAi..."

# 4. Create booking
curl -X POST http://localhost:8000/bookings \
  -H "Authorization: Bearer eyJ0eXAi..." \
  -H "Content-Type: application/json" \
  -d '{
    "profile_id":"profile-123",
    "service_id":"service-456",
    "booking_date":"2025-11-15T14:00:00Z",
    "notes":"Please call 5 minutes before"
  }'

# Returns: {"booking_ref":"A1B2C3","booking_id":"booking-789"}
```

## Future Enhancements (Phase 2+)

- Email notifications on booking confirmation
- Booking slots management with capacity limits
- Admin dashboard for profile owners
- Booking calendar view for businesses
- Payment integration
- Booking cancellation policies
- Review & rating system
- Multi-language support
- SMS notifications

## Dependencies to Add

```
python-jose==3.3.0    # JWT handling
passlib==1.7.4        # Password hashing utilities
bcrypt==4.1.1         # Bcrypt backend
```

## Notes

- Authentication dependency can be reused across all protected routes
- Booking reference generation should handle collisions (low probability with 6-8 chars but check before insert)
- Consider timezone handling for dates (frontend should send UTC)
- Username uniqueness enforced at DB level (unique index)
