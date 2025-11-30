# Admin/Shop Portal - Comprehensive Plan

## Overview

A **separate Next.js application** for business owners and superadmins to manage their booking system. This portal is distinct from the customer-facing frontend and provides powerful management tools.

### Target Users
| Role | Description | Access Level |
|------|-------------|--------------|
| **Superadmin** | System administrator with full access | All features + system settings |
| **Shop Owner** | Business owner managing their shop(s) | Own shop(s) only |

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Existing FastAPI backend (shared with customer frontend)
- **Database**: MongoDB (shared)
- **Authentication**: JWT (same auth system, role-based access)

---

## Project Structure

```
Booking/
├── backend/                 # Existing - shared backend
├── frontend/                # Existing - customer-facing app
├── admin/                   # NEW - Admin/Shop Portal
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── forgot-password/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx          # Dashboard layout with sidebar
│   │   │   │   ├── page.tsx            # Dashboard home
│   │   │   │   ├── bookings/
│   │   │   │   │   ├── page.tsx        # All bookings list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx    # Booking detail
│   │   │   │   ├── availability/
│   │   │   │   │   ├── page.tsx        # Calendar view
│   │   │   │   │   └── manage/
│   │   │   │   │       └── page.tsx    # Bulk slot management
│   │   │   │   ├── services/
│   │   │   │   │   ├── page.tsx        # Services list
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx    # Add service
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── customers/
│   │   │   │   │   ├── page.tsx        # Customer list
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx    # Customer detail
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx        # Reports & analytics
│   │   │   │   ├── settings/
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx    # Shop profile settings
│   │   │   │   │   ├── notifications/
│   │   │   │   │   │   └── page.tsx    # Notification settings
│   │   │   │   │   └── integrations/
│   │   │   │   │       └── page.tsx    # Third-party integrations
│   │   │   │   └── (superadmin)/       # Superadmin only
│   │   │   │       ├── users/
│   │   │   │       │   └── page.tsx    # User management
│   │   │   │       ├── shops/
│   │   │   │       │   └── page.tsx    # All shops management
│   │   │   │       └── system/
│   │   │   │           └── page.tsx    # System settings
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   ├── bookings/
│   │   │   ├── availability/
│   │   │   ├── services/
│   │   │   ├── customers/
│   │   │   └── ui/
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
└── template/                # Existing templates
```

---

## Features Breakdown

### Phase 1: Core Features (MVP)

#### 1.1 Authentication & Authorization
- [ ] Login page (email/password)
- [ ] Forgot password flow
- [ ] Role-based route protection (OWNER, ADMIN)
- [ ] Session management with JWT
- [ ] Auto-logout on token expiry

#### 1.2 Dashboard Home
- [ ] Quick stats cards (Today's bookings, Pending, Revenue)
- [ ] Upcoming bookings list (next 24 hours)
- [ ] Recent activity feed
- [ ] Quick action buttons

#### 1.3 Booking Management
- [ ] **List View**: All bookings with filters
  - Filter by: Status, Date range, Service, Customer
  - Search by: Customer name, Booking ref, Phone
  - Sort by: Date, Created at, Status
- [ ] **Detail View**: Full booking information
- [ ] **Actions**:
  - Approve booking (PENDING → CONFIRMED)
  - Reject booking (PENDING → REJECTED)
  - Cancel booking (any → CANCELLED)
  - Reschedule booking
  - Add notes to booking
- [ ] **Bulk Actions**:
  - Bulk approve/reject
  - Bulk cancel (e.g., for a specific date)

#### 1.4 Availability Management
- [ ] **Calendar View**: Visual month/week/day view
  - Color-coded by availability status
  - Click to view/edit slots
- [ ] **Slot Management**:
  - Add time slots for specific dates
  - Set capacity per slot
  - Block/unblock time slots
  - Recurring slot patterns (e.g., every Monday 9AM-5PM)
- [ ] **Bulk Operations**:
  - Generate slots for date range
  - Copy slots from one day to another
  - Clear all slots for a date

#### 1.5 Service Management
- [ ] **List View**: All services with pricing
- [ ] **CRUD Operations**:
  - Add new service (title, description, price, duration, image)
  - Edit existing service
  - Delete service (soft delete if has bookings)
  - Reorder services (drag & drop)
- [ ] **Service Categories** (future)
- [ ] **Service Variants** (e.g., Regular/Premium)

#### 1.6 Customer Management
- [ ] **List View**: All customers who booked
  - Search by name, email, phone
  - Filter by: Booking count, Last visit, Status
- [ ] **Customer Detail**:
  - Profile information
  - Booking history
  - Total spent
  - Notes
- [ ] **Customer Actions**:
  - Block customer (prevent future bookings)
  - Unblock customer
  - Add internal notes
  - View booking history

---

### Phase 2: Advanced Features

#### 2.1 Analytics & Reports
- [ ] **Dashboard Analytics**:
  - Booking trends (daily/weekly/monthly)
  - Revenue charts
  - Popular services
  - Peak hours heatmap
  - Customer retention rate
- [ ] **Export Reports**:
  - Export to CSV/Excel
  - Date range selection
  - Custom report builder

#### 2.2 Notification System
- [ ] **Email Notifications**:
  - New booking notification
  - Booking status change
  - Daily summary email
  - Low availability alerts
- [ ] **In-App Notifications**:
  - Real-time booking alerts
  - Notification center
  - Mark as read/unread
- [ ] **SMS Notifications** (future)

#### 2.3 Shop Settings
- [ ] **Profile Settings**:
  - Business name, description, logo
  - Contact information
  - Address & location
  - Operating hours
- [ ] **Booking Settings**:
  - Advance booking window (e.g., max 30 days ahead)
  - Minimum notice period (e.g., 2 hours before)
  - Cancellation policy
  - Auto-confirm bookings toggle
- [ ] **Notification Preferences**:
  - Email notification toggles
  - Summary frequency

---

### Phase 3: Superadmin Features

#### 3.1 User Management
- [ ] **View all users**: Customers, Owners, Admins
- [ ] **User Actions**:
  - Create new owner/admin accounts
  - Deactivate/reactivate users
  - Reset user passwords
  - Change user roles
- [ ] **Activity Logs**: User login history

#### 3.2 Shop Management
- [ ] **View all shops**: All registered businesses
- [ ] **Shop Actions**:
  - Approve new shop registrations
  - Suspend/unsuspend shops
  - Feature shops (homepage highlight)
  - View shop analytics

#### 3.3 System Settings
- [ ] **Global Settings**:
  - Platform fees (future)
  - Default booking settings
  - Email templates
- [ ] **Maintenance Mode**: Enable/disable platform
- [ ] **System Health**: API status, DB stats

---

## Backend API Enhancements Required

### New Endpoints Needed

#### Customer Management
```
GET    /admin/customers                    # List all customers (with pagination)
GET    /admin/customers/{id}               # Get customer details
GET    /admin/customers/{id}/bookings      # Get customer's booking history
PUT    /admin/customers/{id}/block         # Block customer
PUT    /admin/customers/{id}/unblock       # Unblock customer
POST   /admin/customers/{id}/notes         # Add note to customer
```

#### Enhanced Booking Endpoints
```
GET    /admin/bookings                     # List all bookings (admin view)
PUT    /admin/bookings/{id}/reschedule     # Reschedule booking
POST   /admin/bookings/bulk-action         # Bulk approve/reject/cancel
GET    /admin/bookings/export              # Export bookings to CSV
```

#### Enhanced Availability Endpoints
```
POST   /admin/availability/generate        # Generate slots for date range
POST   /admin/availability/copy            # Copy slots from one day to another
DELETE /admin/availability/clear           # Clear all slots for a date
PUT    /admin/availability/slots/{id}/block   # Block a slot
PUT    /admin/availability/slots/{id}/unblock # Unblock a slot
```

#### Analytics Endpoints
```
GET    /admin/analytics/overview           # Dashboard stats
GET    /admin/analytics/bookings           # Booking trends
GET    /admin/analytics/revenue            # Revenue analytics
GET    /admin/analytics/services           # Service popularity
GET    /admin/analytics/customers          # Customer analytics
GET    /admin/analytics/peak-hours         # Peak hours data
```

#### Superadmin Endpoints
```
GET    /superadmin/users                   # List all users
POST   /superadmin/users                   # Create user
PUT    /superadmin/users/{id}              # Update user
DELETE /superadmin/users/{id}              # Deactivate user
GET    /superadmin/shops                   # List all shops
PUT    /superadmin/shops/{id}/suspend      # Suspend shop
PUT    /superadmin/shops/{id}/unsuspend    # Unsuspend shop
GET    /superadmin/system/health           # System health check
```

### Database Schema Updates

#### New Collections

**blocked_customers**
```json
{
  "id": "string",
  "profile_id": "string",
  "user_id": "string",
  "blocked_by": "string",
  "blocked_at": "datetime",
  "reason": "string",
  "is_active": "boolean"
}
```

**customer_notes**
```json
{
  "id": "string",
  "profile_id": "string",
  "customer_id": "string",
  "note": "string",
  "created_by": "string",
  "created_at": "datetime"
}
```

**activity_logs**
```json
{
  "id": "string",
  "user_id": "string",
  "action": "string",
  "entity_type": "string",
  "entity_id": "string",
  "details": "object",
  "ip_address": "string",
  "created_at": "datetime"
}
```

---

## UI/UX Design Guidelines

### Color Scheme (Admin Theme)
```css
/* Primary Colors */
--admin-primary: #6366f1;        /* Indigo - main accent */
--admin-primary-dark: #4f46e5;   /* Indigo dark */

/* Background */
--admin-bg: #0f172a;             /* Slate 900 - dark mode */
--admin-bg-card: #1e293b;        /* Slate 800 */
--admin-bg-hover: #334155;       /* Slate 700 */

/* Text */
--admin-text: #f1f5f9;           /* Slate 100 */
--admin-text-muted: #94a3b8;     /* Slate 400 */

/* Status Colors */
--status-confirmed: #22c55e;     /* Green */
--status-pending: #f59e0b;       /* Amber */
--status-cancelled: #ef4444;     /* Red */
--status-rejected: #f97316;      /* Orange */

/* Borders */
--admin-border: #334155;         /* Slate 700 */
```

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Header (Logo, Search, Notifications, User Menu)            │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Sidebar │  Main Content Area                               │
│          │                                                  │
│  - Home  │  ┌─────────────────────────────────────────────┐ │
│  - Book  │  │  Breadcrumb                                 │ │
│  - Avail │  ├─────────────────────────────────────────────┤ │
│  - Serv  │  │                                             │ │
│  - Cust  │  │  Page Content                               │ │
│  - Anal  │  │                                             │ │
│  - Sett  │  │                                             │ │
│          │  │                                             │ │
│          │  └─────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

### Key UI Components
1. **Sidebar**: Collapsible, icon + text, active state highlight
2. **Data Tables**: Sortable, filterable, paginated, row actions
3. **Calendar**: Month/Week/Day views, drag-to-create slots
4. **Modals**: Confirmation dialogs, forms
5. **Toast Notifications**: Success, error, warning, info
6. **Charts**: Line, bar, pie charts for analytics

---

## Implementation Phases

### Phase 1: MVP (2-3 weeks)
**Week 1:**
- Project setup (Next.js, Tailwind, auth context)
- Login page & authentication
- Dashboard layout (sidebar, header)
- Dashboard home with stats

**Week 2:**
- Booking list & detail pages
- Booking actions (approve/reject/cancel)
- Basic availability calendar view
- Add time slots functionality

**Week 3:**
- Service management CRUD
- Customer list & detail
- Block/unblock customers
- Testing & bug fixes

### Phase 2: Advanced Features (2 weeks)
**Week 4:**
- Analytics dashboard
- Export functionality
- Bulk operations
- Notification center

**Week 5:**
- Shop settings pages
- Email notification settings
- Advanced filtering & search
- Performance optimization

### Phase 3: Superadmin (1-2 weeks)
**Week 6:**
- Superadmin routes & protection
- User management
- Shop management
- System settings

**Week 7:**
- Activity logs
- System health monitoring
- Final testing & deployment

---

## Security Considerations

1. **Authentication**
   - JWT with short expiry (15 mins) + refresh tokens
   - Secure HTTP-only cookies
   - CSRF protection

2. **Authorization**
   - Role-based access control (RBAC)
   - Route-level protection
   - API-level permission checks

3. **Data Protection**
   - Input validation & sanitization
   - SQL/NoSQL injection prevention
   - XSS protection
   - Rate limiting on sensitive endpoints

4. **Audit Trail**
   - Log all admin actions
   - Track who did what and when
   - Retain logs for compliance

---

## Development Commands

```bash
# Create new admin project
cd Booking
npx create-next-app@latest admin --typescript --tailwind --app --src-dir

# Install dependencies
cd admin
npm install axios date-fns react-hot-toast @tanstack/react-query
npm install -D @types/node

# Start development
npm run dev -- -p 3001  # Run on port 3001 to avoid conflict with customer frontend

# Build for production
npm run build
```

---

## Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Auth
NEXT_PUBLIC_AUTH_COOKIE_NAME=admin_token
NEXT_PUBLIC_TOKEN_EXPIRY=900000  # 15 minutes

# App
NEXT_PUBLIC_APP_NAME="Booking Admin"
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| API Response Time | < 500ms |
| Mobile Responsive | 100% of pages |
| Test Coverage | > 70% |
| Accessibility | WCAG 2.1 AA |

---

## Future Enhancements

1. **Mobile App** - React Native admin app
2. **Multi-language** - i18n support
3. **Multi-tenant** - White-label solution
4. **Payment Integration** - Stripe/PayPal
5. **Calendar Sync** - Google Calendar, Outlook
6. **AI Features** - Booking predictions, smart scheduling
7. **SMS Notifications** - Twilio integration
8. **Staff Management** - Multiple staff per shop

---

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Query](https://tanstack.com/query)
- [FastAPI](https://fastapi.tiangolo.com)

---

*Document Version: 1.0*
*Created: November 30, 2025*
*Last Updated: November 30, 2025*
