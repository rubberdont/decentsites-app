# Frontend Phase 1 Implementation Plan - Authentication & Booking UI

## Problem Statement
Implement frontend pages for user authentication (login/signup) and booking functionality to connect with the Phase 1 backend APIs. Users need to be able to register, login, browse profiles, select services with a calendar, and create bookings with a confirmation reference number.

## Current State

### Existing Frontend Architecture
- **Framework**: Next.js 15.5.4 (App Router)
- **React Version**: 19.1.0
- **Styling**: Tailwind CSS v4
- **HTTP Client**: axios 1.12.2
- **Icons**: @heroicons/react 2.2.0
- **TypeScript**: Enabled with strict mode

### Current Pages
1. **Home Page** (`/` - `src/app/page.tsx`)
   - Landing page with links to Profile and Customer View
   - Uses Tailwind for styling
   
2. **Business Profile Page** (`/profile` - `src/app/profile/page.tsx`)
   - Manage business information (name, description, image)
   - Add/edit/delete services
   - Uses hardcoded `default-profile` ID
   - Calls existing backend API: `http://localhost:8000/profiles`
   
3. **Customer View Page** (`/customer-view` - `src/app/customer-view/page.tsx`)
   - Public-facing profile view
   - Displays business info and services
   - "Book Now" buttons (not functional yet)
   - Uses hardcoded `default-profile` ID

### Current API Integration
```typescript
const API_BASE = 'http://localhost:8000';
// Existing endpoints used:
// - GET /profiles/{profile_id}
// - POST /profiles
// - PUT /profiles/{profile_id}
// - POST /profiles/{profile_id}/services
// - PUT /profiles/{profile_id}/services/{service_id}
// - DELETE /profiles/{profile_id}/services/{service_id}
```

### Existing TypeScript Interfaces
```typescript
interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
}

interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  services: Service[];
}
```

### Directory Structure
```
frontend/
├── src/
│   └── app/
│       ├── customer-view/
│       │   └── page.tsx
│       ├── profile/
│       │   └── page.tsx
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## Backend API Reference (Phase 1)

### Authentication Endpoints
- `POST /auth/register` - User registration
  - Body: `{ username: string, name: string, password: string }`
  - Returns: `{ id: string, username: string, name: string, created_at: datetime }`
  
- `POST /auth/login` - User login
  - Body: `{ username: string, password: string }`
  - Returns: `{ access_token: string, token_type: "bearer" }`
  
- `GET /auth/me` - Get current user (requires Bearer token)
  - Returns: `{ id: string, username: string, name: string, email?: string, created_at: datetime }`

### Booking Endpoints (All require Bearer token except ref lookup)
- `POST /bookings` - Create booking
  - Body: `{ profile_id: string, service_id?: string, booking_date: datetime, notes?: string }`
  - Returns: `{ booking_ref: string, booking_id: string }`
  
- `GET /bookings` - List user bookings
- `GET /bookings/{booking_id}` - Get booking detail
- `GET /bookings/ref/{booking_ref}` - Public booking lookup
- `PUT /bookings/{booking_id}/cancel` - Cancel booking

### Profile Endpoints (Phase 1 additions)
- Profiles now include `owner_id` field
- `GET /profiles` - List all profiles (public)
- `GET /profiles/{profile_id}` - Get profile (public)

## Proposed Changes - Frontend Phase 1

### 1. New Pages to Create

#### A. Login Page (`/login`)
**File**: `src/app/login/page.tsx`

**Features**:
- Username and password input fields
- "Remember me" checkbox (optional)
- "Forgot password?" link (placeholder for Phase 2)
- Link to signup page
- Form validation (required fields, min lengths)
- Display error messages from API
- On successful login:
  - Store JWT token in localStorage
  - Redirect to profiles list page
  
**API Calls**:
- `POST /auth/login`

**State Management**:
- Form state (username, password)
- Loading state during API call
- Error state for displaying validation/API errors

---

#### B. Signup Page (`/signup`)
**File**: `src/app/signup/page.tsx`

**Features**:
- Username input (3-50 chars, unique)
- Name input (full name)
- Password input (min 6 chars)
- Confirm password field
- Password strength indicator (optional)
- Link to login page
- Form validation (match passwords, required fields)
- Display error messages from API (e.g., username exists)
- On successful signup:
  - Auto-login or redirect to login with success message
  
**API Calls**:
- `POST /auth/register`

**State Management**:
- Form state (username, name, password, confirmPassword)
- Loading state
- Error state
- Success state

---

#### C. Profiles List Page (`/profiles`)
**File**: `src/app/profiles/page.tsx`

**Features**:
- List all available business profiles (cards/grid)
- Display profile name, description, image (if available)
- Show number of services available
- Click card to navigate to profile detail
- Search/filter functionality (optional Phase 2)
- Logout button in header
- Show current user name in header
- Public page (no auth required)

**API Calls**:
- `GET /profiles` - List all profiles

**State Management**:
- Profiles list
- Loading state
- Current user info (from token)

---

#### D. Profile Detail & Booking Page (`/profiles/[profileId]`)
**File**: `src/app/profiles/[profileId]/page.tsx`

**Features**:
- Display profile information (name, description, image)
- Show all services with details (title, description, price)
- Calendar component for date selection
  - Only allow future dates
  - Display selected date
  - Can use simple HTML5 date input or library (react-datepicker?)
- Service selection (if profile has services)
  - Modal or inline selection
  - Show service details when selected
- Booking notes textarea (optional)
- "Confirm Booking" button
  - Requires authentication (check token)
  - If not logged in, redirect to login with return URL
- Booking confirmation modal after successful booking:
  - Display booking reference (6-8 char code)
  - "Copy Reference" button
  - Link to view booking details
  - Link to continue browsing

**API Calls**:
- `GET /profiles/{profileId}` - Get profile details
- `POST /bookings` - Create booking (requires auth)

**State Management**:
- Profile data
- Selected date
- Selected service
- Booking notes
- Show booking confirmation modal
- Booking reference
- Loading/error states

---

#### E. My Bookings Page (`/my-bookings`)
**File**: `src/app/my-bookings/page.tsx`

**Features**:
- List all bookings for current user
- Display booking info:
  - Profile name
  - Service name (if applicable)
  - Booking date
  - Status (PENDING, CONFIRMED, REJECTED, CANCELLED)
  - Booking reference
  - Notes
- Status badges with colors:
  - PENDING: yellow/orange
  - CONFIRMED: green
  - REJECTED: red
  - CANCELLED: gray
- "Cancel Booking" button (only for PENDING/CONFIRMED bookings)
- "View Details" link
- Filter by status (optional)
- Requires authentication

**API Calls**:
- `GET /bookings` - List user bookings
- `PUT /bookings/{booking_id}/cancel` - Cancel booking

**State Management**:
- Bookings list
- Loading/error states
- Selected booking for cancellation

---

#### F. Booking Lookup Page (`/booking-lookup`)
**File**: `src/app/booking-lookup/page.tsx`

**Features**:
- Input field for booking reference
- "Search" button
- Display booking details if found:
  - Profile name
  - Service name
  - Date and time
  - Status
  - Notes
- Error message if not found
- Public page (no auth required)

**API Calls**:
- `GET /bookings/ref/{booking_ref}` - Lookup booking

**State Management**:
- Booking reference input
- Booking data
- Loading/error states

---

### 2. Shared Components to Create

#### A. Authentication Context (`src/context/AuthContext.tsx`)
**Purpose**: Global auth state management

**Features**:
- Store current user info
- Store JWT token
- `login(token)` function - stores token, fetches user info
- `logout()` function - clears token, redirects to login
- `isAuthenticated` boolean
- `user` object
- Automatic token refresh or expiry check (optional)

**Methods**:
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

---

#### B. Protected Route Component (`src/components/ProtectedRoute.tsx`)
**Purpose**: Wrapper for pages that require authentication

**Features**:
- Check if user is authenticated
- If not, redirect to login with return URL
- Show loading spinner while checking auth
- Pass children through if authenticated

---

#### C. Navigation Header (`src/components/Header.tsx`)
**Purpose**: Site-wide navigation

**Features**:
- Logo/site name
- Links to:
  - Home
  - Profiles (browse)
  - My Bookings (if authenticated)
  - Booking Lookup
- Right side:
  - User name + avatar (if authenticated)
  - Login/Signup buttons (if not authenticated)
  - Logout button (if authenticated)
- Mobile responsive hamburger menu

---

#### D. Booking Confirmation Modal (`src/components/BookingConfirmationModal.tsx`)
**Purpose**: Show booking reference after successful booking

**Features**:
- Display booking reference prominently (large text)
- "Copy to Clipboard" button
- Success animation/icon
- Booking details summary
- Actions:
  - View My Bookings
  - Continue Browsing
  - Close modal

---

#### E. Calendar Component (`src/components/Calendar.tsx` or use library)
**Purpose**: Date selection for bookings

**Options**:
1. Use HTML5 date input (simple, native)
2. Use `react-datepicker` library (better UX)
3. Build custom with date-fns

**Features**:
- Disable past dates
- Highlight selected date
- Show available slots (Phase 2)
- Time slot selection (Phase 2)

---

### 3. API Service Layer

#### File: `src/services/api.ts`
**Purpose**: Centralized API calls with axios

**Features**:
- Base axios instance with `baseURL`
- Automatic Bearer token injection from localStorage
- Interceptors for error handling (401 → logout)
- Typed API methods:

```typescript
// Auth
export const authAPI = {
  register: (data: RegisterData) => axios.post('/auth/register', data),
  login: (data: LoginData) => axios.post('/auth/login', data),
  getCurrentUser: () => axios.get('/auth/me'),
};

// Profiles
export const profilesAPI = {
  getAll: () => axios.get('/profiles'),
  getById: (id: string) => axios.get(`/profiles/${id}`),
  // ... existing profile methods
};

// Bookings
export const bookingsAPI = {
  create: (data: BookingCreateData) => axios.post('/bookings', data),
  getUserBookings: () => axios.get('/bookings'),
  getByRef: (ref: string) => axios.get(`/bookings/ref/${ref}`),
  cancel: (id: string) => axios.put(`/bookings/${id}/cancel`),
};
```

---

### 4. TypeScript Types

#### File: `src/types/index.ts`
**New types needed**:

```typescript
// Auth
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// Bookings
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string;
  profile_id: string;
  service_id?: string;
  booking_date: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  profile_id: string;
  service_id?: string;
  booking_date: string;
  notes?: string;
}

export interface BookingRefResponse {
  booking_ref: string;
  booking_id: string;
}

// Update existing
export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  owner_id?: string; // NEW in Phase 1
  services: Service[];
}
```

---

### 5. Utility Functions

#### File: `src/utils/auth.ts`
```typescript
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
```

#### File: `src/utils/date.ts`
```typescript
export const formatBookingDate = (date: Date): string => {
  return date.toISOString();
};

export const formatDisplayDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isDateInFuture = (date: Date): boolean => {
  return date > new Date();
};
```

---

### 6. Updated Directory Structure (After Implementation)

```
frontend/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   ├── profiles/
│   │   │   ├── page.tsx              # List all profiles
│   │   │   └── [profileId]/
│   │   │       └── page.tsx          # Profile detail + booking
│   │   ├── my-bookings/
│   │   │   └── page.tsx
│   │   ├── booking-lookup/
│   │   │   └── page.tsx
│   │   ├── customer-view/
│   │   │   └── page.tsx              # Keep for Phase 2
│   │   ├── profile/
│   │   │   └── page.tsx              # Keep for business owners
│   │   ├── globals.css
│   │   ├── layout.tsx                # Updated with Header
│   │   └── page.tsx                  # Updated landing
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── BookingConfirmationModal.tsx
│   │   └── Calendar.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── auth.ts
│       └── date.ts
├── .plan/
│   └── FRONTEND_PHASE_1_PLAN.md
├── package.json
└── tsconfig.json
```

---

## Implementation Order

### Phase 1.1: Foundation
1. Create types file (`src/types/index.ts`)
2. Create auth utilities (`src/utils/auth.ts`, `src/utils/date.ts`)
3. Create API service layer (`src/services/api.ts`)
4. Create AuthContext (`src/context/AuthContext.tsx`)
5. Update root layout to include AuthContext provider

### Phase 1.2: Authentication Pages
6. Create Login page (`/login`)
7. Create Signup page (`/signup`)
8. Test auth flow (register → login → store token)

### Phase 1.3: Navigation & Components
9. Create Header component
10. Create ProtectedRoute component
11. Update root layout to include Header
12. Update home page with updated navigation

### Phase 1.4: Profiles & Booking
13. Create Profiles list page (`/profiles`)
14. Create Profile detail page (`/profiles/[profileId]`)
15. Create Calendar component
16. Create BookingConfirmationModal component
17. Implement booking flow

### Phase 1.5: Booking Management
18. Create My Bookings page (`/my-bookings`)
19. Create Booking Lookup page (`/booking-lookup`)
20. Implement cancel booking functionality

### Phase 1.6: Testing & Polish
21. Test all user flows end-to-end
22. Add loading states and error handling
23. Mobile responsive testing
24. Update existing pages (profile, customer-view) if needed

---

## User Flow - Frontend

### Flow 1: New User Signup & Booking
```
1. User visits home page (/) 
2. Clicks "Sign Up"
3. Fills signup form (/signup)
4. Redirects to profiles list (/profiles) after signup
5. Browses profiles and clicks one
6. Views profile details (/profiles/[id])
7. Selects date and service
8. Clicks "Confirm Booking"
9. Sees confirmation modal with booking_ref
10. Can copy reference or view bookings
```

### Flow 2: Existing User Login & Booking
```
1. User visits home page (/)
2. Clicks "Login"
3. Enters credentials (/login)
4. Redirects to profiles list (/profiles)
5. Selects profile and makes booking
6. Views booking in My Bookings (/my-bookings)
```

### Flow 3: Public Booking Lookup
```
1. User visits home page (/)
2. Clicks "Lookup Booking" or navigates to /booking-lookup
3. Enters booking reference
4. Views booking details (no auth required)
```

---

## Design Considerations

### 1. Authentication Strategy
- **Token Storage**: localStorage (simple, works for SPA)
  - Alternative: httpOnly cookies (more secure, needs backend changes)
- **Token Expiry**: 24 hours (backend config)
- **Auto-logout**: On 401 response from API

### 2. State Management
- **Auth**: React Context (simple, no external library needed)
- **Form State**: Local useState (no complex state needed)
- **Alternative**: Consider Zustand or Redux if app grows

### 3. Calendar Library
- **Option 1**: HTML5 `<input type="date">` (simple, native)
- **Option 2**: `react-datepicker` (better UX, more customizable)
- **Recommendation**: Start with HTML5, upgrade if needed

### 4. Styling Approach
- Continue using Tailwind CSS v4 (already configured)
- Use existing color scheme from current pages
- Responsive design (mobile-first)

### 5. Error Handling
- Display user-friendly error messages
- Show validation errors inline (form fields)
- Show API errors in toast/modal
- Redirect to login on 401

### 6. Loading States
- Show spinners during API calls
- Disable buttons during submission
- Skeleton loaders for data fetching (optional)

---

## Dependencies to Add

Consider adding (optional):
```json
{
  "dependencies": {
    "react-datepicker": "^4.x.x",     // For better calendar UX
    "date-fns": "^2.x.x",             // Date utilities
    "react-hot-toast": "^2.x.x"       // Toast notifications
  },
  "devDependencies": {
    "@types/react-datepicker": "^4.x.x"
  }
}
```

**Note**: All are optional. Can implement Phase 1 with existing dependencies.

---

## Testing Checklist

### Functional Tests
- [ ] User can register with valid credentials
- [ ] User cannot register with duplicate username
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] Token is stored in localStorage after login
- [ ] User can browse profiles without authentication
- [ ] User is redirected to login when trying to book without auth
- [ ] Authenticated user can create booking
- [ ] Booking confirmation modal shows correct reference
- [ ] User can copy booking reference to clipboard
- [ ] User can view their bookings in My Bookings page
- [ ] User can cancel PENDING or CONFIRMED bookings
- [ ] Anyone can lookup booking by reference
- [ ] User is logged out on 401 response
- [ ] Protected routes redirect to login when not authenticated

### UI/UX Tests
- [ ] All forms have proper validation
- [ ] Error messages are clear and helpful
- [ ] Loading states are shown during async operations
- [ ] Success messages are shown after actions
- [ ] Mobile responsive on all pages
- [ ] Navigation is intuitive
- [ ] Buttons have hover states
- [ ] Forms are accessible (labels, error announcements)

---

## API Integration Summary

| Frontend Page | Backend Endpoints Used |
|---------------|------------------------|
| `/login` | `POST /auth/login` |
| `/signup` | `POST /auth/register` |
| `/profiles` | `GET /profiles` |
| `/profiles/[id]` | `GET /profiles/{id}`, `POST /bookings` |
| `/my-bookings` | `GET /bookings`, `PUT /bookings/{id}/cancel` |
| `/booking-lookup` | `GET /bookings/ref/{ref}` |
| All protected pages | `GET /auth/me` (on mount) |

---

## Next Steps (Phase 2)

- Implement business owner dashboard
- Add booking management for owners (confirm/reject)
- Add availability calendar with slot limits
- Add email notifications
- Add profile ownership assignment during creation
- Add forgot password flow
- Add profile search and filtering
- Add booking cancellation policies
- Add payment integration

---

## Notes

- All dates should be sent to backend in ISO 8601 format (UTC)
- Backend expects `Authorization: Bearer <token>` header for protected endpoints
- Booking reference is 6-8 character alphanumeric code (e.g., "A1B2C3D")
- Profile `owner_id` field was added in backend Phase 1 (optional for now)
- Backend validates booking date is in future
- Status colors: PENDING (yellow), CONFIRMED (green), REJECTED (red), CANCELLED (gray)
