# Frontend Phase 2 Implementation Plan - Advanced Features & Owner Dashboard

## Problem Statement
Extend the frontend with business owner dashboard, availability calendar with time slots, profile reviews, enhanced user profile management, and improved booking experience. This phase enables business owners to manage their profiles and bookings while providing customers with a richer experience.

## Phase 1 Completion Status

### ✅ Completed in Phase 1
- Login and signup pages with JWT authentication
- Profile list page (browse all profiles)
- Profile detail page with booking functionality
- My Bookings page (view and cancel bookings)
- Booking lookup by reference
- AuthContext for global auth state
- API service layer with token injection
- Protected routes
- Booking confirmation modal
- Header navigation

### Current Architecture
```
frontend/src/
├── app/
│   ├── login/
│   ├── signup/
│   ├── profiles/
│   │   ├── page.tsx              # List all profiles
│   │   └── [profileId]/
│   │       └── page.tsx          # Profile detail + booking
│   ├── my-bookings/
│   ├── booking-lookup/
│   ├── customer-view/            # Existing
│   ├── profile/                  # Existing (business edit)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   └── BookingConfirmationModal.tsx
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

---

## Phase 2 Proposed Features

### 1. Business Owner Dashboard

#### A. Owner Dashboard Page (`/owner/dashboard`)
**File**: `src/app/owner/dashboard/page.tsx`

**Features**:
- Dashboard overview cards:
  - Total bookings
  - Pending bookings (requiring action)
  - Today's bookings
  - This week's bookings
  - Total revenue (if payment implemented)
- Quick actions:
  - Create new profile
  - View all bookings
  - Manage profiles
- Recent bookings list (last 10)
- Booking status breakdown chart
- Requires: User role = OWNER or ADMIN

**API Calls**:
- `GET /owners/dashboard` - Dashboard stats
- `GET /owners/my-profiles` - Owner's profiles

**State Management**:
- Dashboard stats
- Recent bookings
- Loading/error states

---

#### B. Owner Profiles Management (`/owner/profiles`)
**File**: `src/app/owner/profiles/page.tsx`

**Features**:
- List all profiles owned by current user
- Display profile cards with:
  - Profile name and image
  - Number of services
  - Total bookings count
  - Active/inactive status
  - Quick actions (edit, view bookings, analytics)
- "Create New Profile" button
- Filter by status (active/inactive)
- Requires: OWNER role

**API Calls**:
- `GET /owners/my-profiles` - List owner profiles

**State Management**:
- Profiles list
- Filter state
- Loading/error states

---

#### C. Profile Analytics Page (`/owner/profiles/[profileId]/analytics`)
**File**: `src/app/owner/profiles/[profileId]/analytics/page.tsx`

**Features**:
- Booking trends chart (line chart by date)
- Popular services (bar chart)
- Revenue by service (pie chart)
- Booking status breakdown
- Date range selector
- Export to CSV/PDF
- Requires: OWNER role

**API Calls**:
- `GET /owners/profiles/{profileId}/analytics` - Profile analytics

**Libraries Needed**:
- Chart library: `recharts` or `chart.js`

---

#### D. Owner Bookings Management (`/owner/bookings`)
**File**: `src/app/owner/bookings/page.tsx`

**Features**:
- List all bookings for owner's profiles
- Table view with columns:
  - Booking reference
  - Customer name
  - Profile name
  - Service
  - Date & time
  - Status
  - Actions (confirm, reject, cancel, notes)
- Filter by:
  - Status (pending, confirmed, rejected, cancelled)
  - Profile
  - Date range
- Bulk actions (confirm multiple, export)
- Pagination
- Requires: OWNER role

**API Calls**:
- `GET /bookings/profile/{profile_id}/bookings` - Get profile bookings (loop for all profiles)
- `PUT /bookings/{booking_id}/status` - Update status
- `PUT /bookings/{booking_id}/reject` - Reject with reason
- `PUT /bookings/{booking_id}/notes` - Add owner notes

**State Management**:
- Bookings list
- Filter state
- Selected bookings (for bulk actions)
- Loading/error states

---

### 2. Availability & Time Slot Management

#### A. Availability Calendar Page (`/owner/profiles/[profileId]/availability`)
**File**: `src/app/owner/profiles/[profileId]/availability/page.tsx`

**Features**:
- Month view calendar showing availability
- Click date to manage slots for that day
- Slot configuration:
  - Business hours (start time, end time)
  - Slot duration (15min, 30min, 1hr, etc.)
  - Max capacity per slot
- Bulk create slots for multiple dates
- View booked vs available slots
- Color coding:
  - Green: Available slots
  - Yellow: Partially booked
  - Red: Fully booked
  - Gray: No availability set
- Requires: OWNER role

**API Calls**:
- `GET /availability/profiles/{profileId}` - Get availability for month
- `POST /availability/profiles/{profileId}/slots` - Create slots
- `PUT /availability/slots/{slotId}` - Update slot
- `DELETE /availability/slots/{slotId}` - Remove slot

**Components**:
- `AvailabilityCalendar.tsx` - Month calendar view
- `SlotConfigModal.tsx` - Configure slots for a date
- `TimeSlotPicker.tsx` - Select time slot UI

**Libraries Needed**:
- Calendar library: `react-big-calendar` or `fullcalendar`

---

#### B. Enhanced Booking Page with Time Slots
**Update**: `src/app/profiles/[profileId]/page.tsx`

**New Features**:
- Display available time slots for selected date
- Only show dates with availability
- Show remaining capacity per slot
- Select time slot before booking
- Real-time availability updates

**API Calls**:
- `GET /availability/profiles/{profileId}/dates/{date}` - Get slots for date

**State Management**:
- Selected date
- Available time slots
- Selected time slot
- Loading states

---

### 3. Reviews & Ratings

#### A. Reviews Section on Profile Page
**Update**: `src/app/profiles/[profileId]/page.tsx`

**New Features**:
- Display reviews below services
- Show average rating (stars) and total count
- List individual reviews with:
  - User name
  - Rating (stars)
  - Comment
  - Date
- Pagination for reviews
- Filter by rating

**API Calls**:
- `GET /reviews/profile/{profileId}` - Get reviews
- `GET /reviews/profile/{profileId}/summary` - Get rating summary

**Components**:
- `ReviewsList.tsx` - Display reviews
- `RatingStars.tsx` - Star rating display
- `ReviewCard.tsx` - Individual review

---

#### B. Submit Review Page (`/bookings/[bookingId]/review`)
**File**: `src/app/bookings/[bookingId]/review/page.tsx`

**Features**:
- Only accessible for completed bookings (CONFIRMED + past date)
- Star rating selector (1-5 stars)
- Comment textarea
- Submit button
- Success message after submission
- One review per booking
- Requires: USER role, must be booking owner

**API Calls**:
- `POST /reviews` - Create review

**Components**:
- `StarRatingInput.tsx` - Interactive star rating

**State Management**:
- Rating value
- Comment text
- Loading/error states

---

#### C. My Reviews Page (`/my-reviews`)
**File**: `src/app/my-reviews/page.tsx`

**Features**:
- List all reviews submitted by user
- Display:
  - Profile reviewed
  - Rating given
  - Comment
  - Date submitted
- Edit review (optional)
- Delete review
- Requires: Authentication

**API Calls**:
- `GET /reviews/user` - Get user's reviews (may need new endpoint)
- `DELETE /reviews/{reviewId}` - Delete review

---

### 4. Enhanced User Profile

#### A. User Profile Settings Page (`/settings/profile`)
**File**: `src/app/settings/profile/page.tsx`

**Features**:
- Update user information:
  - Name
  - Email
  - Username (read-only)
- Email verification status
- Notification preferences:
  - Email notifications on/off
  - Booking confirmations
  - Booking reminders
  - Status updates
- Save button
- Requires: Authentication

**API Calls**:
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile

**State Management**:
- Profile form state
- Notification preferences
- Loading/error states

---

#### B. Change Password Page (`/settings/password`)
**File**: `src/app/settings/password/page.tsx`

**Features**:
- Current password input
- New password input
- Confirm new password input
- Password strength indicator
- Save button
- Success/error messages
- Requires: Authentication

**API Calls**:
- `PUT /auth/password` - Change password

**State Management**:
- Form state
- Loading/error states
- Success message

---

#### C. Forgot Password Flow
**Files**: 
- `src/app/forgot-password/page.tsx`
- `src/app/reset-password/page.tsx`

**Forgot Password Page**:
- Email input
- Send reset link button
- Success message (check email)
- Link back to login

**Reset Password Page**:
- New password input
- Confirm password input
- Reset token in URL
- Submit button
- Redirect to login on success

**API Calls**:
- `POST /auth/forgot-password` - Request reset
- `POST /auth/reset-password` - Reset with token

---

### 5. Advanced Search & Filtering

#### A. Enhanced Profiles Page
**Update**: `src/app/profiles/page.tsx`

**New Features**:
- Search bar (search by name/description)
- Filter sidebar:
  - Category dropdown (if categories added)
  - Price range slider
  - Location dropdown
  - Rating filter (4+ stars, 3+ stars, etc.)
  - Verified profiles only checkbox
- Sort options:
  - Highest rated
  - Most popular (most bookings)
  - Newest
  - Price (low to high / high to low)
- Results count
- Grid/list view toggle

**API Calls**:
- `GET /profiles/search?q={query}&category={cat}&min_price={min}&max_price={max}&location={loc}&min_rating={rating}&sort={sort}`

**Components**:
- `SearchBar.tsx` - Search input
- `FilterSidebar.tsx` - Filters panel
- `ProfileCard.tsx` - Enhanced with rating display

**State Management**:
- Search query
- Active filters
- Sort option
- View mode (grid/list)

---

### 6. Admin Panel (if user.role === ADMIN)

#### A. Admin Dashboard (`/admin/dashboard`)
**File**: `src/app/admin/dashboard/page.tsx`

**Features**:
- Platform-wide statistics:
  - Total users
  - Total profiles
  - Total bookings
  - Revenue
- Recent activity feed
- User growth chart
- Booking trends chart
- Quick actions:
  - Manage users
  - Verify profiles
  - View all bookings
- Requires: ADMIN role

**API Calls**:
- `GET /admin/analytics` - Platform analytics

---

#### B. User Management (`/admin/users`)
**File**: `src/app/admin/users/page.tsx`

**Features**:
- List all users with table view
- Columns: username, name, email, role, created_at, actions
- Search users
- Filter by role
- Change user role (USER ↔ OWNER ↔ ADMIN)
- Pagination
- Requires: ADMIN role

**API Calls**:
- `GET /admin/users` - List all users
- `PUT /admin/users/{userId}/role` - Change role

---

#### C. Profile Verification (`/admin/profiles`)
**File**: `src/app/admin/profiles/page.tsx`

**Features**:
- List all profiles
- Filter: verified, unverified, inactive
- Verify/unverify profiles
- View profile details
- Deactivate/activate profiles
- Requires: ADMIN role

**API Calls**:
- `GET /admin/profiles` - List all profiles
- `PUT /admin/profiles/{profileId}/verify` - Verify profile
- `PUT /admin/profiles/{profileId}/deactivate` - Deactivate

---

### 7. Enhanced Booking Experience

#### A. Booking Confirmation with Email
**Update**: `src/components/BookingConfirmationModal.tsx`

**New Features**:
- Display "Check your email for confirmation"
- Show user's email address
- Resend confirmation email button (optional)
- Add to calendar button (download .ics file)

---

#### B. Booking Details Page (`/bookings/[bookingId]`)
**File**: `src/app/bookings/[bookingId]/page.tsx`

**Features**:
- Full booking details:
  - Booking reference (large, copyable)
  - Profile information
  - Service details
  - Date and time
  - Status with color badge
  - Notes
  - Created date
- Actions:
  - Cancel booking (if allowed)
  - Submit review (if eligible)
  - Print details
  - Download as PDF
- Status history timeline (optional)

**API Calls**:
- `GET /bookings/{bookingId}` - Get booking details

---

#### C. Booking Cancellation with Reason
**Component**: `CancelBookingModal.tsx`

**Features**:
- Cancellation reason textarea (optional)
- Confirmation dialog
- Success message
- Automatic refresh of booking list

**API Calls**:
- `PUT /bookings/{bookingId}/cancel` - Cancel booking

---

### 8. Notifications & Toasts

#### A. Toast Notification System
**Library**: `react-hot-toast` or `sonner`

**Usage**:
- Success notifications (booking created, profile updated)
- Error notifications (API errors)
- Info notifications (email sent, reminder set)
- Loading notifications (long operations)

**Implementation**:
```typescript
// src/utils/toast.ts
import toast from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};
```

---

#### B. In-App Notifications (Optional)
**File**: `src/app/notifications/page.tsx`

**Features**:
- List of in-app notifications
- Mark as read
- Delete notification
- Filter: unread, all
- Notification types:
  - Booking confirmed
  - Booking cancelled
  - New review
  - Profile verified

**API Calls** (requires new backend endpoints):
- `GET /notifications` - Get user notifications
- `PUT /notifications/{id}/read` - Mark as read

---

### 9. Improved UI/UX

#### A. Loading States & Skeletons
**Components**:
- `ProfileCardSkeleton.tsx` - Loading placeholder for profile cards
- `BookingTableSkeleton.tsx` - Loading placeholder for booking table
- `DashboardStatsSkeleton.tsx` - Loading placeholder for dashboard

**Library**: `react-loading-skeleton`

---

#### B. Empty States
**Components**:
- `EmptyState.tsx` - Reusable empty state component

**Usage**:
- No bookings yet
- No profiles found
- No reviews yet
- Search returned no results

---

#### C. Error Boundaries
**Component**: `ErrorBoundary.tsx`

**Features**:
- Catch React errors
- Display friendly error message
- "Try again" button
- Report error (optional)

---

#### D. Accessibility Improvements
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management (modals, forms)
- Screen reader announcements
- Color contrast compliance (WCAG AA)

---

### 10. Mobile Optimization

#### A. Responsive Components
- Mobile-friendly navigation (hamburger menu)
- Touch-optimized buttons and inputs
- Responsive tables (convert to cards on mobile)
- Mobile calendar picker
- Bottom sheet modals on mobile

#### B. Progressive Web App (PWA)
**Features**:
- Add to home screen
- Offline support (service worker)
- Push notifications (optional)
- App manifest

**Files**:
- `public/manifest.json`
- `src/app/sw.js` (service worker)

---

## Updated Directory Structure (After Phase 2)

```
frontend/src/
├── app/
│   ├── admin/                    # NEW
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── profiles/
│   ├── owner/                    # NEW
│   │   ├── dashboard/
│   │   ├── profiles/
│   │   │   └── [profileId]/
│   │   │       ├── analytics/
│   │   │       └── availability/
│   │   └── bookings/
│   ├── settings/                 # NEW
│   │   ├── profile/
│   │   └── password/
│   ├── bookings/
│   │   └── [bookingId]/
│   │       ├── page.tsx          # NEW - booking details
│   │       └── review/           # NEW
│   ├── my-reviews/               # NEW
│   ├── forgot-password/          # NEW
│   ├── reset-password/           # NEW
│   ├── notifications/            # NEW (optional)
│   ├── login/
│   ├── signup/
│   ├── profiles/
│   │   ├── page.tsx              # Updated with search/filter
│   │   └── [profileId]/
│   │       └── page.tsx          # Updated with reviews, slots
│   ├── my-bookings/
│   ├── booking-lookup/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── admin/                    # NEW
│   │   ├── UserTable.tsx
│   │   ├── ProfileVerificationCard.tsx
│   │   └── AnalyticsChart.tsx
│   ├── owner/                    # NEW
│   │   ├── DashboardStats.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── SlotConfigModal.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   └── BookingActionsMenu.tsx
│   ├── reviews/                  # NEW
│   │   ├── ReviewsList.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── StarRating.tsx
│   │   └── StarRatingInput.tsx
│   ├── search/                   # NEW
│   │   ├── SearchBar.tsx
│   │   ├── FilterSidebar.tsx
│   │   └── SortDropdown.tsx
│   ├── Header.tsx                # Updated with role-based menu
│   ├── ProtectedRoute.tsx        # Updated with role checks
│   ├── BookingConfirmationModal.tsx  # Updated
│   ├── CancelBookingModal.tsx    # NEW
│   ├── EmptyState.tsx            # NEW
│   ├── ErrorBoundary.tsx         # NEW
│   └── LoadingSkeleton.tsx       # NEW
├── context/
│   ├── AuthContext.tsx           # Updated with role
│   └── NotificationContext.tsx   # NEW (optional)
├── services/
│   └── api.ts                    # Updated with new endpoints
├── types/
│   └── index.ts                  # Updated with new types
├── utils/
│   ├── auth.ts
│   ├── date.ts
│   ├── toast.ts                  # NEW
│   └── charts.ts                 # NEW
└── hooks/
    ├── useDebounce.ts            # NEW
    ├── usePagination.ts          # NEW
    └── useMediaQuery.ts          # NEW
```

---

## New Dependencies

```json
{
  "dependencies": {
    "react-hot-toast": "^2.4.1",        // Toast notifications
    "recharts": "^2.10.0",              // Charts for analytics
    "react-big-calendar": "^1.8.5",     // Calendar for availability
    "date-fns": "^2.30.0",              // Date utilities
    "react-loading-skeleton": "^3.3.1", // Loading placeholders
    "@headlessui/react": "^1.7.17",     // Accessible UI components
    "clsx": "^2.0.0",                   // className utility
    "sonner": "^1.2.0"                  // Alternative to react-hot-toast
  },
  "devDependencies": {
    "@types/react-big-calendar": "^1.8.5"
  }
}
```

---

## Implementation Priority

### High Priority (Core Features)
1. Owner Dashboard - Essential for business owners
2. Availability & Time Slots - Core booking feature
3. Owner Bookings Management - Manage incoming bookings
4. Enhanced User Profile - Email, password management
5. Reviews & Ratings - Trust and social proof

### Medium Priority (Value-Add)
6. Advanced Search & Filtering - Better discovery
7. Booking Details Page - Enhanced experience
8. Toast Notifications - Better feedback
9. Loading States & Skeletons - Improved UX

### Low Priority (Nice-to-Have)
10. Admin Panel - Only if needed
11. PWA Features - Offline support
12. In-App Notifications - Real-time updates

---

## TypeScript Types to Add

```typescript
// src/types/index.ts additions

// Owner
export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  today_bookings: number;
  this_week_bookings: number;
  total_revenue: number;
}

export interface ProfileAnalytics {
  profile_id: string;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  popular_services: ServiceStats[];
  booking_trend: DateCount[];
}

// Availability
export interface TimeSlot {
  id: string;
  profile_id: string;
  date: string;
  time_slot: string;
  max_capacity: number;
  booked_count: number;
  is_available: boolean;
}

export interface TimeSlotConfig {
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_capacity_per_slot: number;
}

// Reviews
export interface Review {
  id: string;
  booking_id: string;
  profile_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ReviewSummary {
  profile_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: { [key: number]: number };
}

// User Roles
export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  created_at: string;
}
```

---

## Testing Checklist

### Owner Features
- [ ] Owner can view dashboard with accurate stats
- [ ] Owner can create/edit/delete profiles
- [ ] Owner can view profile analytics charts
- [ ] Owner can manage bookings (confirm/reject/cancel)
- [ ] Owner can set availability slots
- [ ] Owner can view booking calendar

### Reviews
- [ ] User can submit review for completed booking
- [ ] Reviews display on profile page
- [ ] Average rating calculates correctly
- [ ] User cannot review same booking twice
- [ ] User can delete their own review

### User Profile
- [ ] User can update profile information
- [ ] User can change password
- [ ] User can request password reset
- [ ] Password reset link works correctly
- [ ] Email validation works

### Search & Filtering
- [ ] Search returns relevant results
- [ ] Filters work correctly
- [ ] Sort options work correctly
- [ ] Results update without page reload

### Admin Features
- [ ] Admin can view all users
- [ ] Admin can change user roles
- [ ] Admin can verify profiles
- [ ] Admin can view platform analytics

### UI/UX
- [ ] Loading states display correctly
- [ ] Empty states show appropriate messages
- [ ] Toast notifications appear and dismiss
- [ ] Mobile responsive on all pages
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

---

## Performance Optimizations

1. **Code Splitting** - Lazy load routes with `next/dynamic`
2. **Image Optimization** - Use `next/image` for all images
3. **Memoization** - Use `React.memo`, `useMemo`, `useCallback`
4. **Virtual Lists** - Use `react-window` for long lists
5. **Debouncing** - Debounce search input
6. **Caching** - Cache API responses with SWR or React Query

---

## Accessibility Requirements

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive elements

---

## Next Steps (Phase 3)

- Real-time notifications with WebSockets
- Video consultations integration
- Advanced analytics with AI insights
- Multi-language support (i18n)
- Dark mode toggle
- Mobile apps (React Native)
- Integration with Google Calendar
- SMS notifications
- Payment processing UI (Stripe Elements)
- Advanced booking rules (recurring, packages)
