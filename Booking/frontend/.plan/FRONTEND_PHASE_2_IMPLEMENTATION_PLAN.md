# Frontend Phase 2 Implementation Plan

## Problem Statement

The backend Phase 2 has been completed with owner dashboard APIs, availability/time slot management, role-based access control, and enhanced authentication features. The frontend currently only supports basic user functionality (login, signup, profile browsing, and booking) without any owner-specific features or role-based access. This plan outlines implementing the frontend to consume all Phase 2 backend APIs and provide a complete owner dashboard experience.

## Current State Analysis

### Backend Implementation (✅ Complete)

**Available Endpoints:**

**Auth Module** (`/auth`):
- `GET /auth/me` - Get current user with role
- `PUT /auth/profile` - Update user profile (name, email)
- `PUT /auth/password` - Change password
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

**Owner Module** (`/owners`):
- `GET /owners/dashboard` - Dashboard stats (bookings, revenue)
- `GET /owners/my-profiles` - List owner's profiles with booking counts
- `GET /owners/profiles/{id}/analytics` - Profile-specific analytics

**Availability Module** (`/availability`):
- `POST /availability/profiles/{id}/slots` - Create availability slots (owner only)
- `GET /availability/profiles/{id}` - Get availability for date range (public)
- `GET /availability/profiles/{id}/dates/{date}` - Get slots for specific date (public)
- `PUT /availability/slots/{slot_id}` - Update slot capacity (owner only)
- `DELETE /availability/slots/{slot_id}` - Delete slot (owner only)

**Role System:**
```python
class UserRole(str, Enum):
    USER = "USER"
    OWNER = "OWNER"
    ADMIN = "ADMIN"
```

### Frontend Current State

**Directory Structure:**
```
frontend/src/
├── app/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── profiles/
│   │   ├── page.tsx              # Browse profiles
│   │   └── [profileId]/page.tsx  # Profile detail + booking
│   ├── my-bookings/page.tsx
│   ├── booking-lookup/page.tsx
│   ├── customer-view/page.tsx
│   ├── profile/page.tsx          # Business profile edit (existing)
│   └── calendar-demo/page.tsx
├── components/
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   ├── BookingConfirmationModal.tsx
│   └── Calendar.tsx
├── context/
│   └── AuthContext.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
└── utils/
    ├── auth.ts
    └── date.ts
```

**Existing API Service** (`services/api.ts`):
- `authAPI`: register, login, getCurrentUser
- `profilesAPI`: CRUD operations
- `bookingsAPI`: create, getUserBookings, getById, getByRef, cancel

**Current Type Definitions** (`types/index.ts`):
```typescript
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  created_at: string;
  // MISSING: role field
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
```

**Current Dependencies:**
- Next.js 15.5.4
- React 19.1.0
- axios 1.12.2
- @heroicons/react 2.2.0
- TailwindCSS 4

## Proposed Implementation

### Phase 2.1: Foundation Updates (HIGH PRIORITY)

#### 1. Update Type Definitions
**File:** `src/types/index.ts`

**Add:**
```typescript
// User Roles
export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

// Update User interface
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  created_at: string;
}

// Owner Dashboard Types
export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  today_bookings: number;
  this_week_bookings: number;
  total_revenue: number;
}

export interface ServiceStats {
  service_id: string;
  service_title: string;
  total_bookings: number;
  revenue: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface ProfileAnalytics {
  profile_id: string;
  profile_name: string;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  popular_services: ServiceStats[];
  booking_trend: DateCount[];
}

export interface ProfileWithBookingCount {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  owner_id: string;
  services: Service[];
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
}

// Availability Types
export interface TimeSlotConfig {
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_capacity_per_slot: number;
}

export interface AvailabilitySlot {
  id: string;
  profile_id: string;
  date: string;
  time_slot: string;
  max_capacity: number;
  booked_count: number;
  is_available: boolean;
}

export interface AvailabilityCreate {
  date: string;
  config: TimeSlotConfig;
}

export interface DateAvailability {
  date: string;
  total_slots: number;
  available_slots: number;
  slots: AvailabilitySlot[];
}

export interface SlotCapacityUpdate {
  max_capacity: number;
}

// User Profile Update Types
export interface UserProfileUpdate {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}
```

#### 2. Extend API Service
**File:** `src/services/api.ts`

**Add to authAPI:**
```typescript
export const authAPI = {
  // ... existing methods
  updateProfile: (data: UserProfileUpdate) => 
    api.put<User>('/auth/profile', data),
  
  changePassword: (data: ChangePasswordRequest) => 
    api.put('/auth/password', data),
  
  forgotPassword: (data: ForgotPasswordRequest) => 
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: ResetPasswordRequest) => 
    api.post<TokenResponse>('/auth/reset-password', data),
};
```

**Add new APIs:**
```typescript
// Owner API
export const ownerAPI = {
  getDashboard: () => 
    api.get<DashboardStats>('/owners/dashboard'),
  
  getMyProfiles: (skip = 0, limit = 10) => 
    api.get<ProfileWithBookingCount[]>(`/owners/my-profiles?skip=${skip}&limit=${limit}`),
  
  getProfileAnalytics: (profileId: string) => 
    api.get<ProfileAnalytics>(`/owners/profiles/${profileId}/analytics`),
};

// Availability API
export const availabilityAPI = {
  createSlots: (profileId: string, data: AvailabilityCreate) => 
    api.post<AvailabilitySlot[]>(`/availability/profiles/${profileId}/slots`, data),
  
  getAvailability: (profileId: string, startDate: string, endDate: string) => 
    api.get<DateAvailability[]>(`/availability/profiles/${profileId}?start_date=${startDate}&end_date=${endDate}`),
  
  getSlotsForDate: (profileId: string, date: string) => 
    api.get<DateAvailability>(`/availability/profiles/${profileId}/dates/${date}`),
  
  updateSlotCapacity: (slotId: string, data: SlotCapacityUpdate) => 
    api.put<AvailabilitySlot>(`/availability/slots/${slotId}`, data),
  
  deleteSlot: (slotId: string) => 
    api.delete(`/availability/slots/${slotId}`),
};
```

#### 3. Update AuthContext with Role Support
**File:** `src/context/AuthContext.tsx`

**Current Issues:**
- User interface doesn't include role
- No role-based helper methods

**Changes:**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOwner: boolean;        // NEW
  isAdmin: boolean;        // NEW
  hasRole: (role: UserRole) => boolean;  // NEW
  login: (token: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  loading: boolean;
}

// In AuthProvider:
const isOwner = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;
const isAdmin = user?.role === UserRole.ADMIN;

const hasRole = (role: UserRole): boolean => {
  if (!user) return false;
  if (role === UserRole.ADMIN) return user.role === UserRole.ADMIN;
  if (role === UserRole.OWNER) return user.role === UserRole.OWNER || user.role === UserRole.ADMIN;
  return true; // USER role
};
```

#### 4. Update Header Navigation
**File:** `src/components/Header.tsx`

**Add role-based navigation:**
```tsx
{isAuthenticated && isOwner && (
  <Link href="/owner/dashboard">
    Owner Dashboard
  </Link>
)}

{isAuthenticated && isAdmin && (
  <Link href="/admin/dashboard">
    Admin Panel
  </Link>
)}
```

### Phase 2.2: Owner Dashboard (HIGH PRIORITY)

#### 5. Owner Dashboard Page
**New File:** `src/app/owner/dashboard/page.tsx`

**Features:**
- Dashboard stats cards (total bookings, pending, today's, this week)
- Recent bookings list
- Quick actions (create profile, view bookings)
- Protected by role check (OWNER or ADMIN)

**API Calls:**
- `ownerAPI.getDashboard()`
- `ownerAPI.getMyProfiles()`

**Key Components:**
- `DashboardStatsCard` - Display metric cards
- Use existing `ProtectedRoute` wrapper
- Add role check inside component

#### 6. Owner Profiles Management Page
**New File:** `src/app/owner/profiles/page.tsx`

**Features:**
- List all profiles owned by current user
- Display profile cards with booking counts
- Quick actions (edit, view bookings, analytics, availability)
- Create new profile button

**API Calls:**
- `ownerAPI.getMyProfiles()`

#### 7. Profile Analytics Page
**New File:** `src/app/owner/profiles/[profileId]/analytics/page.tsx`

**Features:**
- Booking trends chart
- Popular services breakdown
- Booking status distribution
- Date range selector

**API Calls:**
- `ownerAPI.getProfileAnalytics(profileId)`

**Dependencies to Install:**
```json
"recharts": "^2.10.0"  // For charts
```

### Phase 2.3: Availability Management (HIGH PRIORITY)

#### 8. Availability Calendar Page
**New File:** `src/app/owner/profiles/[profileId]/availability/page.tsx`

**Features:**
- Month calendar view
- Click date to manage slots
- Slot configuration modal
- Color coding (available, partially booked, fully booked)

**API Calls:**
- `availabilityAPI.getAvailability(profileId, startDate, endDate)`
- `availabilityAPI.createSlots(profileId, data)`
- `availabilityAPI.updateSlotCapacity(slotId, data)`
- `availabilityAPI.deleteSlot(slotId)`

**New Components:**
- `AvailabilityCalendar.tsx` - Month calendar view
- `SlotConfigModal.tsx` - Configure slots for date
- `TimeSlotList.tsx` - List of time slots for a date

**Dependencies to Install:**
```json
"react-big-calendar": "^1.8.5",
"date-fns": "^2.30.0",
"@types/react-big-calendar": "^1.8.5"
```

#### 9. Enhanced Booking Page with Time Slots
**Update File:** `src/app/profiles/[profileId]/page.tsx`

**Current State:**
- Uses simple Calendar component for date selection
- No time slot selection

**New Features:**
- Display available time slots for selected date
- Show remaining capacity per slot
- Select time slot before booking
- Only show dates with availability

**API Calls:**
- `availabilityAPI.getSlotsForDate(profileId, date)`

**New Components:**
- `TimeSlotPicker.tsx` - Select available time slot

**Changes to Booking Flow:**
1. User selects date
2. Fetch available slots for that date
3. Display time slots with capacity
4. User selects time slot
5. Submit booking with time slot info

### Phase 2.4: User Profile Management (MEDIUM PRIORITY)

#### 10. User Profile Settings Page
**New File:** `src/app/settings/profile/page.tsx`

**Features:**
- Update name and email
- Display username (read-only)
- Success/error notifications

**API Calls:**
- `authAPI.getCurrentUser()`
- `authAPI.updateProfile(data)`

#### 11. Change Password Page
**New File:** `src/app/settings/password/page.tsx`

**Features:**
- Current password input
- New password input
- Confirm new password
- Password strength indicator

**API Calls:**
- `authAPI.changePassword(data)`

#### 12. Forgot Password Flow
**New Files:**
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`

**Forgot Password Page:**
- Email input
- Send reset link button

**Reset Password Page:**
- Extract token from URL query params
- New password input
- Confirm password input
- Redirect to login after success

**API Calls:**
- `authAPI.forgotPassword(data)`
- `authAPI.resetPassword(data)`

### Phase 2.5: UI/UX Enhancements (MEDIUM PRIORITY)

#### 13. Toast Notification System
**New File:** `src/utils/toast.ts`

**Install:**
```json
"react-hot-toast": "^2.4.1"
```

**Usage:**
- Success notifications (booking created, profile updated)
- Error notifications (API errors)
- Loading notifications

**Implementation:**
```typescript
import toast from 'react-hot-toast';

export const showSuccess = (message: string) => toast.success(message);
export const showError = (message: string) => toast.error(message);
export const showLoading = (message: string) => toast.loading(message);
```

**Add to layout:**
```tsx
import { Toaster } from 'react-hot-toast';

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

#### 14. Loading Skeleton Components
**New Files:**
- `src/components/skeletons/ProfileCardSkeleton.tsx`
- `src/components/skeletons/DashboardStatsSkeleton.tsx`
- `src/components/skeletons/BookingTableSkeleton.tsx`

**Install:**
```json
"react-loading-skeleton": "^3.3.1"
```

#### 15. Empty State Component
**New File:** `src/components/EmptyState.tsx`

**Reusable component for:**
- No bookings yet
- No profiles found
- No reviews yet
- No search results

## Implementation Priority

### Sprint 1 (Week 1) - Foundation
1. ✅ Update type definitions with roles and new types
2. ✅ Extend API service with owner and availability endpoints
3. ✅ Update AuthContext with role support
4. ✅ Update Header with role-based navigation
5. ✅ Install core dependencies (recharts, react-hot-toast)

### Sprint 2 (Week 2) - Owner Dashboard
6. ✅ Owner Dashboard page with stats
7. ✅ Owner Profiles management page
8. ✅ Profile Analytics page with charts
9. ✅ Toast notification system

### Sprint 3 (Week 3) - Availability System
10. ✅ Install calendar dependencies (react-big-calendar, date-fns)
11. ✅ Availability Calendar page with slot management
12. ✅ SlotConfigModal component
13. ✅ TimeSlotPicker component
14. ✅ Update booking page with time slot selection

### Sprint 4 (Week 4) - User Profile & Polish
15. ✅ User profile settings page
16. ✅ Change password page
17. ✅ Forgot/reset password flow
18. ✅ Loading skeleton components
19. ✅ Empty state component
20. ✅ Testing and bug fixes

## Dependencies to Install

```bash
npm install recharts react-hot-toast react-big-calendar date-fns react-loading-skeleton
npm install -D @types/react-big-calendar
```

**Full package.json additions:**
```json
{
  "dependencies": {
    "recharts": "^2.10.0",
    "react-hot-toast": "^2.4.1",
    "react-big-calendar": "^1.8.5",
    "date-fns": "^2.30.0",
    "react-loading-skeleton": "^3.3.1"
  },
  "devDependencies": {
    "@types/react-big-calendar": "^1.8.5"
  }
}
```

## Testing Checklist

### Role-Based Access
- [ ] USER role can access customer features only
- [ ] OWNER role can access owner dashboard
- [ ] ADMIN role can access both owner and admin features
- [ ] Unauthorized users redirected appropriately

### Owner Dashboard
- [ ] Dashboard displays correct statistics
- [ ] Profile list shows accurate booking counts
- [ ] Analytics charts render correctly
- [ ] Quick actions work as expected

### Availability Management
- [ ] Owner can create time slots for dates
- [ ] Calendar displays availability correctly
- [ ] Time slot capacity updates work
- [ ] Slot deletion works
- [ ] Customers see only available slots

### Booking with Time Slots
- [ ] Available slots display for selected date
- [ ] User can select time slot
- [ ] Booking respects slot capacity
- [ ] Fully booked slots don't appear

### User Profile
- [ ] User can update name and email
- [ ] Email validation works
- [ ] Password change requires old password
- [ ] Password reset flow works end-to-end

### UI/UX
- [ ] Toast notifications appear correctly
- [ ] Loading skeletons display during data fetch
- [ ] Empty states show appropriate messages
- [ ] Mobile responsive on all pages
- [ ] Dark mode works (if supported)

## Known Issues & Limitations

1. **Backend Dependencies:**
   - Reviews system not yet implemented in backend (Phase 3)
   - Admin panel endpoints not yet available
   - Email sending is configured but may need SMTP setup

2. **Frontend Limitations:**
   - No real-time updates (WebSocket not implemented)
   - No push notifications
   - Calendar library may have accessibility issues

3. **Future Enhancements (Phase 3):**
   - Reviews & Ratings UI
   - Admin panel implementation
   - Advanced search and filtering
   - Booking reminders UI
   - Payment integration UI

## File Structure After Implementation

```
frontend/src/
├── app/
│   ├── owner/                    # NEW
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Owner dashboard
│   │   ├── profiles/
│   │   │   ├── page.tsx          # Owner's profiles list
│   │   │   └── [profileId]/
│   │   │       ├── analytics/
│   │   │       │   └── page.tsx  # Profile analytics
│   │   │       └── availability/
│   │   │           └── page.tsx  # Availability calendar
│   ├── settings/                 # NEW
│   │   ├── profile/
│   │   │   └── page.tsx          # User profile settings
│   │   └── password/
│   │       └── page.tsx          # Change password
│   ├── forgot-password/          # NEW
│   │   └── page.tsx
│   ├── reset-password/           # NEW
│   │   └── page.tsx
│   ├── login/
│   ├── signup/
│   ├── profiles/
│   │   ├── page.tsx              # UPDATED with time slots
│   │   └── [profileId]/
│   │       └── page.tsx
│   ├── my-bookings/
│   ├── booking-lookup/
│   └── layout.tsx                # UPDATED with Toaster
├── components/
│   ├── owner/                    # NEW
│   │   ├── DashboardStatsCard.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── SlotConfigModal.tsx
│   │   └── TimeSlotList.tsx
│   ├── skeletons/                # NEW
│   │   ├── ProfileCardSkeleton.tsx
│   │   ├── DashboardStatsSkeleton.tsx
│   │   └── BookingTableSkeleton.tsx
│   ├── TimeSlotPicker.tsx        # NEW
│   ├── EmptyState.tsx            # NEW
│   ├── Header.tsx                # UPDATED with role nav
│   ├── ProtectedRoute.tsx
│   ├── BookingConfirmationModal.tsx
│   └── Calendar.tsx
├── context/
│   └── AuthContext.tsx           # UPDATED with role support
├── services/
│   └── api.ts                    # UPDATED with new endpoints
├── types/
│   └── index.ts                  # UPDATED with new types
└── utils/
    ├── auth.ts
    ├── date.ts
    └── toast.ts                  # NEW
```

## Next Steps Before Implementation

1. **Backend Verification:**
   - Test all owner endpoints with Postman/Thunder Client
   - Verify role-based access control works
   - Confirm availability slot creation and querying
   - Test password reset token generation

2. **Environment Setup:**
   - Ensure backend is running on http://localhost:8000
   - Verify MongoDB is accessible
   - Check SMTP credentials if email testing needed

3. **Get Approval:**
   - Review this plan with stakeholders
   - Confirm priority order
   - Adjust timeline if needed

---

**Status:** READY FOR REVIEW ✅
**Estimated Duration:** 4 weeks (4 sprints)
**Risk Level:** Medium (new calendar library, complex state management)
**Backend Dependency:** Phase 2 Complete ✅
