# Backend Phase 2 Implementation Plan - Advanced Features

## Problem Statement
Extend the booking system with advanced features including business owner dashboard, availability management with slot limits, email notifications, profile ownership management, and enhanced security features. This phase focuses on improving the business owner experience and adding robust capacity management.

## Phase 1 Completion Status

### ✅ Completed in Phase 1
- User authentication (JWT, bcrypt)
- User registration and login
- Booking creation with status workflow (PENDING, CONFIRMED, REJECTED, CANCELLED)
- Profile management (CRUD operations)
- Service management (embedded in profiles)
- Booking reference generation (6-8 char codes)
- Access control (users can only see own bookings, owners can manage their profile bookings)
- Public booking lookup by reference

### Current Architecture
```
backend/
├── core/
│   ├── mongo_helper.py          # MongoDB abstraction
│   └── security.py              # JWT & password hashing
├── modules/
│   ├── auth/                    # Authentication
│   │   ├── models.py
│   │   ├── repository.py
│   │   ├── security.py
│   │   └── routes.py
│   ├── profiles/                # Business profiles
│   │   ├── models.py            # Has owner_id field
│   │   ├── repository.py
│   │   └── routes.py
│   └── bookings/                # Bookings
│       ├── models.py            # BookingStatus enum
│       ├── repository.py
│       └── routes.py
└── main.py
```

### Current API Endpoints (Phase 1)
**Auth**: POST /auth/register, POST /auth/login, GET /auth/me
**Profiles**: GET/POST/PUT/DELETE /profiles, service CRUD
**Bookings**: POST /bookings, GET /bookings, GET /bookings/{id}, GET /bookings/ref/{ref}, PUT /bookings/{id}/status, PUT /bookings/{id}/cancel, GET /bookings/profile/{profile_id}/bookings

---

## Phase 2 Proposed Features

### 1. Business Owner Dashboard Module

#### A. New Endpoint: Owner Profile Management
**File**: `modules/owners/routes.py`

**New Endpoints**:
- `GET /owners/dashboard` - Dashboard overview (protected, owner only)
  - Returns: Total bookings count, pending count, today's bookings, revenue stats
  
- `GET /owners/my-profiles` - List profiles owned by current user
  - Returns: List of profiles with booking counts
  
- `POST /owners/profiles` - Create profile with automatic owner assignment
  - Sets owner_id to current user
  - Returns: Created profile
  
- `GET /owners/profiles/{profile_id}/analytics` - Profile analytics
  - Returns: Booking trends, popular services, revenue by service

**Implementation**:
```python
# modules/owners/models.py
class DashboardStats(BaseModel):
    total_bookings: int
    pending_bookings: int
    confirmed_bookings: int
    today_bookings: int
    this_week_bookings: int
    total_revenue: float

class ProfileAnalytics(BaseModel):
    profile_id: str
    total_bookings: int
    confirmed_bookings: int
    cancelled_bookings: int
    popular_services: List[ServiceStats]
    booking_trend: List[DateCount]
```

---

### 2. Availability & Slot Management

#### A. New Collection: `availability_slots`
**Purpose**: Manage booking capacity by date and time

**Schema**:
```python
{
  _id: ObjectId,
  id: str (UUID),
  profile_id: str,
  date: datetime (date only, normalized to midnight),
  time_slot: str (e.g., "09:00-10:00", "10:00-11:00"),
  max_capacity: int,
  booked_count: int,
  is_available: bool,
  created_at: datetime,
  updated_at: datetime
}
```

#### B. New Module: `modules/availability/`

**Files**:
- `models.py`
  - `TimeSlot(BaseModel)` - Represents a time slot
  - `AvailabilitySlot(BaseModel)` - Full slot model
  - `AvailabilityCreate(BaseModel)` - Create slots
  - `AvailabilityResponse(BaseModel)` - Response model
  - `DateAvailability(BaseModel)` - Summary for a date

- `repository.py`
  - `create_slots_for_date(profile_id, date, slots_config)` - Bulk create slots
  - `get_available_slots(profile_id, date)` - Get available slots for date
  - `check_slot_availability(profile_id, date, time_slot)` - Check specific slot
  - `increment_booked_count(slot_id)` - Book a slot
  - `decrement_booked_count(slot_id)` - Release a slot
  - `update_slot_capacity(slot_id, new_capacity)` - Update max capacity

- `routes.py`
  - `POST /availability/profiles/{profile_id}/slots` - Create availability slots (owner only)
  - `GET /availability/profiles/{profile_id}` - Get availability for date range
  - `GET /availability/profiles/{profile_id}/dates/{date}` - Get slots for specific date
  - `PUT /availability/slots/{slot_id}` - Update slot capacity (owner only)
  - `DELETE /availability/slots/{slot_id}` - Remove slot (owner only)

**Integration with Bookings**:
- When creating booking, check if slot is available
- If slot-based booking, increment booked_count
- On cancellation, decrement booked_count
- Add `time_slot` field to Booking model (optional)

**Implementation**:
```python
# modules/availability/models.py
class TimeSlotConfig(BaseModel):
    start_time: str  # "09:00"
    end_time: str    # "17:00"
    slot_duration: int  # minutes (e.g., 60 for 1-hour slots)
    max_capacity_per_slot: int

class AvailabilitySlot(BaseModel):
    id: str
    profile_id: str
    date: datetime
    time_slot: str
    max_capacity: int
    booked_count: int
    is_available: bool

class DateAvailability(BaseModel):
    date: datetime
    total_slots: int
    available_slots: int
    slots: List[AvailabilitySlot]
```

---

### 3. Email Notifications

#### A. New Module: `modules/notifications/`

**Purpose**: Send email notifications for booking events

**Files**:
- `email_service.py`
  - `send_email(to, subject, body, html)` - Send email via SMTP
  - `send_booking_confirmation(user_email, booking)` - Booking created notification
  - `send_booking_status_update(user_email, booking, new_status)` - Status change
  - `send_owner_new_booking(owner_email, booking)` - Notify owner of new booking
  - `send_cancellation_notification(emails, booking)` - Cancellation notice

- `templates.py`
  - HTML email templates for each notification type
  - Support for dynamic data injection

- `models.py`
  - `EmailConfig(BaseModel)` - Email configuration
  - `NotificationPreferences(BaseModel)` - User notification settings

**Email Triggers**:
1. **Booking Created** → Email to user with booking reference
2. **Booking Created** → Email to profile owner (new booking notification)
3. **Status Changed to CONFIRMED** → Email to user
4. **Status Changed to REJECTED** → Email to user with reason
5. **Booking Cancelled** → Email to both user and owner

**Dependencies**:
- Add to requirements.txt: `python-emails==0.6.0` or `sendgrid==6.x.x`

**Environment Variables** (`.env`):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@bookingapp.com
```

**Implementation**:
```python
# modules/notifications/email_service.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class EmailService:
    @staticmethod
    async def send_booking_confirmation(
        user_email: str,
        booking_ref: str,
        profile_name: str,
        booking_date: datetime
    ):
        subject = f"Booking Confirmed - Reference: {booking_ref}"
        html = f"""
        <h2>Your Booking is Confirmed!</h2>
        <p>Booking Reference: <strong>{booking_ref}</strong></p>
        <p>Business: {profile_name}</p>
        <p>Date: {booking_date.strftime('%B %d, %Y at %I:%M %p')}</p>
        <p>Please save this reference for your records.</p>
        """
        # Send email logic
```

---

### 4. Enhanced User & Profile Management

#### A. Add Email Field to Users
**Update**: `modules/auth/models.py`

```python
class UserRegister(BaseModel):
    username: str
    name: str
    password: str
    email: EmailStr  # NEW - use Pydantic EmailStr for validation

class UserProfile(BaseModel):
    # NEW model for user profile updates
    name: Optional[str]
    email: Optional[EmailStr]
    notification_preferences: Optional[Dict[str, bool]]
```

**New Endpoints**:
- `PUT /auth/profile` - Update user profile (protected)
- `PUT /auth/password` - Change password (protected)
- `POST /auth/forgot-password` - Initiate password reset
- `POST /auth/reset-password` - Complete password reset with token

#### B. Profile Verification & Status
**Update**: `modules/profiles/models.py`

```python
class BusinessProfile(BaseModel):
    # Existing fields...
    owner_id: str  # Make required (not optional)
    email: Optional[EmailStr]  # NEW - contact email
    phone: Optional[str]  # NEW - contact phone
    address: Optional[str]  # NEW - business address
    is_verified: bool = False  # NEW - verified by admin
    is_active: bool = True  # NEW - can be deactivated
    created_at: datetime
    updated_at: datetime
```

**New Endpoints**:
- `POST /profiles/{profile_id}/verify` - Verify profile (admin only)
- `PUT /profiles/{profile_id}/deactivate` - Deactivate profile (owner or admin)
- `PUT /profiles/{profile_id}/activate` - Activate profile (owner or admin)

---

### 5. Reviews & Ratings System

#### A. New Collection: `reviews`
**Schema**:
```python
{
  _id: ObjectId,
  id: str (UUID),
  booking_id: str,
  profile_id: str,
  user_id: str,
  rating: int (1-5),
  comment: Optional[str],
  created_at: datetime,
  updated_at: datetime
}
```

#### B. New Module: `modules/reviews/`

**Files**:
- `models.py`
  - `ReviewCreate(BaseModel)` - Create review (requires completed booking)
  - `ReviewResponse(BaseModel)` - Review with user name
  - `ReviewSummary(BaseModel)` - Aggregate ratings for profile

- `repository.py`
  - `create_review(booking_id, user_id, profile_id, rating, comment)`
  - `get_profile_reviews(profile_id, skip, limit)`
  - `get_review_summary(profile_id)` - Average rating, total count
  - `user_can_review(user_id, booking_id)` - Check if user can review

- `routes.py`
  - `POST /reviews` - Create review (protected, requires completed booking)
  - `GET /reviews/profile/{profile_id}` - Get profile reviews (public)
  - `GET /reviews/profile/{profile_id}/summary` - Get rating summary (public)
  - `DELETE /reviews/{review_id}` - Delete own review (protected)

**Business Rules**:
- User can only review bookings that are CONFIRMED and past the booking date
- One review per booking
- Only the review author can delete their review
- Reviews are public and visible on profile pages

---

### 6. Admin & Role Management

#### A. Add Role System
**Update**: `modules/auth/models.py`

```python
class UserRole(str, Enum):
    USER = "USER"
    OWNER = "OWNER"
    ADMIN = "ADMIN"

class User(BaseModel):
    # Existing fields...
    role: UserRole = UserRole.USER  # NEW - default to USER
```

**New Middleware**: `modules/auth/security.py`
```python
async def require_admin(current_user: UserCredentials = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def require_owner(current_user: UserCredentials = Depends(get_current_user)):
    if current_user.role not in [UserRole.OWNER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Owner access required")
    return current_user
```

#### B. Admin Endpoints
**New Module**: `modules/admin/routes.py`

**Endpoints**:
- `GET /admin/users` - List all users (admin only)
- `PUT /admin/users/{user_id}/role` - Change user role (admin only)
- `GET /admin/bookings` - List all bookings (admin only)
- `GET /admin/profiles` - List all profiles with stats (admin only)
- `PUT /admin/profiles/{profile_id}/verify` - Verify profile (admin only)
- `GET /admin/analytics` - Platform-wide analytics (admin only)

---

### 7. Enhanced Booking Features

#### A. Booking Notes & Communication
**Update**: `modules/bookings/models.py`

```python
class Booking(BaseModel):
    # Existing fields...
    special_requests: Optional[str]  # Customer special requests
    owner_notes: Optional[str]  # Private notes from owner
    rejection_reason: Optional[str]  # Reason for rejection
```

**New Endpoints**:
- `PUT /bookings/{booking_id}/notes` - Update owner notes (owner only)
- `PUT /bookings/{booking_id}/reject` - Reject with reason (owner only)

#### B. Booking Reminders
**New Module**: `modules/reminders/`

**Purpose**: Scheduled task to send reminders

**Features**:
- Send reminder 24 hours before booking
- Send reminder 1 hour before booking
- Use background task scheduler (e.g., APScheduler)

**Implementation**:
```python
# modules/reminders/scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('interval', hours=1)
async def send_booking_reminders():
    # Check bookings in next 24 hours
    # Send reminders
    pass
```

---

### 8. Payment Integration (Optional - Stripe)

#### A. New Module: `modules/payments/`

**Files**:
- `stripe_service.py` - Stripe API integration
- `models.py` - Payment models
- `routes.py` - Payment endpoints

**Endpoints**:
- `POST /payments/intent` - Create payment intent (protected)
- `POST /payments/confirm` - Confirm payment (protected)
- `GET /payments/booking/{booking_id}` - Get payment status

**Dependencies**:
- Add to requirements.txt: `stripe==7.x.x`

**Environment**:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Booking Flow with Payment**:
1. User creates booking → Status: PENDING_PAYMENT
2. Payment intent created
3. Frontend confirms payment
4. Backend verifies payment → Status: CONFIRMED
5. Notify owner

---

### 9. Search & Filtering

#### A. Enhanced Profile Search
**Update**: `modules/profiles/routes.py`

**New Endpoint**:
- `GET /profiles/search?q={query}&category={category}&min_price={price}&location={location}`
  - Full-text search on name and description
  - Filter by category (add category field to profiles)
  - Filter by price range
  - Filter by location (add location field)

**Implementation**:
```python
# Use MongoDB text indexes
@router.get("/search")
async def search_profiles(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    location: Optional[str] = None
):
    # Build MongoDB query with filters
    query = {}
    if q:
        query["$text"] = {"$search": q}
    if category:
        query["category"] = category
    # ... etc
```

---

### 10. Database Optimizations

#### A. Add Indexes
**Implementation**:
```python
# Add to startup event in main.py
@app.on_event("startup")
async def create_indexes():
    db = mongo_db.get_database()
    
    # Users
    db.users.create_index("username", unique=True)
    db.users.create_index("email")
    
    # Bookings
    db.bookings.create_index("booking_ref", unique=True)
    db.bookings.create_index("user_id")
    db.bookings.create_index("profile_id")
    db.bookings.create_index("booking_date")
    db.bookings.create_index([("profile_id", 1), ("booking_date", 1)])
    
    # Profiles
    db.profiles.create_index("owner_id")
    db.profiles.create_index([("name", "text"), ("description", "text")])
    
    # Availability
    db.availability_slots.create_index([("profile_id", 1), ("date", 1)])
    
    # Reviews
    db.reviews.create_index("profile_id")
    db.reviews.create_index("booking_id", unique=True)
```

---

## Updated Directory Structure (After Phase 2)

```
backend/
├── core/
│   ├── mongo_helper.py
│   ├── security.py
│   └── email.py                  # NEW - email utilities
├── modules/
│   ├── auth/
│   │   ├── models.py             # Updated with email, role
│   │   ├── repository.py
│   │   ├── security.py           # Added role checks
│   │   └── routes.py             # Added profile, password endpoints
│   ├── profiles/
│   │   ├── models.py             # Updated with contact info, status
│   │   ├── repository.py         # Added search
│   │   └── routes.py             # Added search, verification
│   ├── bookings/
│   │   ├── models.py             # Updated with notes, time_slot
│   │   ├── repository.py
│   │   └── routes.py             # Added reject with reason
│   ├── owners/                   # NEW
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── routes.py
│   ├── availability/             # NEW
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── routes.py
│   ├── notifications/            # NEW
│   │   ├── email_service.py
│   │   ├── templates.py
│   │   └── models.py
│   ├── reviews/                  # NEW
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── routes.py
│   ├── admin/                    # NEW
│   │   ├── models.py
│   │   ├── repository.py
│   │   └── routes.py
│   ├── payments/                 # NEW (Optional)
│   │   ├── stripe_service.py
│   │   ├── models.py
│   │   └── routes.py
│   └── reminders/                # NEW
│       ├── scheduler.py
│       └── tasks.py
└── main.py                       # Updated with new routers, scheduler
```

---

## Implementation Priority

### High Priority (Core Features)
1. Business Owner Dashboard - Essential for owners to manage bookings
2. Availability & Slot Management - Core booking capacity feature
3. Email Notifications - Critical for user experience
4. Enhanced User Profile - Add email, password reset

### Medium Priority (Value-Add)
5. Reviews & Ratings - Builds trust and engagement
6. Enhanced Booking Features - Improves communication
7. Search & Filtering - Better profile discovery
8. Database Indexes - Performance optimization

### Low Priority (Nice-to-Have)
9. Admin Panel - Needed only if platform grows
10. Payment Integration - Can defer if not needed initially
11. Booking Reminders - Automated convenience feature

---

## New Dependencies

```
# requirements.txt additions
pydantic[email]==2.11.9    # Email validation
python-emails==0.6.0       # Email sending (or sendgrid==6.x.x)
apscheduler==3.10.4        # Task scheduling
stripe==7.x.x              # Payment (optional)
```

---

## Environment Variables (.env additions)

```
# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@bookingapp.com

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Admin
ADMIN_EMAIL=admin@bookingapp.com
ADMIN_USERNAME=admin
```

---

## Testing Checklist

### Owner Dashboard
- [ ] Owner can view dashboard with stats
- [ ] Owner can list their profiles
- [ ] Owner can create profile with auto-assigned owner_id
- [ ] Owner can view profile analytics

### Availability Management
- [ ] Owner can create availability slots
- [ ] Slots prevent overbooking
- [ ] Users can only book available slots
- [ ] Slot count decrements on booking
- [ ] Slot count increments on cancellation

### Email Notifications
- [ ] User receives confirmation email on booking
- [ ] Owner receives notification of new booking
- [ ] User receives email on status change
- [ ] Emails contain correct information

### Reviews
- [ ] User can review completed bookings
- [ ] User cannot review same booking twice
- [ ] Reviews display on profile page
- [ ] Average rating calculated correctly

### Admin Features
- [ ] Admin can list all users
- [ ] Admin can change user roles
- [ ] Admin can verify profiles
- [ ] Admin can view platform analytics

---

## Security Enhancements

1. **Rate Limiting** - Add rate limiter to prevent abuse
2. **Email Verification** - Verify email on registration
3. **2FA** - Two-factor authentication (Phase 3)
4. **API Key Authentication** - For external integrations
5. **Audit Logging** - Log all sensitive operations

---

## Migration Notes

### Database Migrations Required
1. Add `email` field to users (make optional for existing users)
2. Add `role` field to users (default to USER)
3. Add `owner_id`, `email`, `phone`, `address`, `is_verified`, `is_active` to profiles
4. Add `time_slot`, `special_requests`, `owner_notes`, `rejection_reason` to bookings

### Backward Compatibility
- All new fields are optional to not break existing data
- API endpoints remain backward compatible
- New endpoints are additive

---

## Performance Considerations

1. **Caching** - Cache frequently accessed profiles
2. **Pagination** - Add pagination to all list endpoints
3. **Background Tasks** - Use Celery for heavy operations
4. **Database Connection Pooling** - Configure MongoDB connection pool
5. **CDN** - Use CDN for profile/service images

---

## Next Steps (Phase 3)

- Mobile app (React Native or Flutter)
- Advanced analytics & reporting
- Multi-language support
- Subscription/membership tiers
- Loyalty programs
- Integration with calendar apps (Google Calendar, Outlook)
- SMS notifications
- Advanced search with AI recommendations
