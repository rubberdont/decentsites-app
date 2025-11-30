# Booking System

A comprehensive booking management system with customer-facing booking, owner admin portal, and robust backend API.

## 🏗️ Architecture

The system consists of three main applications:

| Application | Port | Description |
|-------------|------|-------------|
| **Frontend** | 3000 | Customer-facing booking interface |
| **Backend** | 8000 | FastAPI REST API |
| **Admin Portal** | 3001 | Owner/Admin dashboard |

## ✨ Features

### Customer Features (Frontend)
- 🏠 Business landing page with services showcase
- 📅 Interactive booking calendar with time slot selection
- 🔐 User authentication (login/signup)
- 📋 View and manage personal bookings
- 🔍 Booking lookup by reference number

### Owner/Admin Features (Admin Portal)
- 📊 Dashboard with booking stats and revenue
- 📅 Booking management (approve, reject, cancel, reschedule)
- 👥 Customer management (view history, block/unblock, notes)
- ⏰ Availability management with slot templates
- 📈 Analytics and reporting
- 🏢 Business profile and service management

### Backend API
- 🔑 JWT-based authentication with role-based access (USER, OWNER, ADMIN)
- 📧 Email notifications for booking confirmations
- 🗄️ MongoDB database with aggregation pipelines
- 📝 Comprehensive admin endpoints

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **Admin Portal** | Next.js 15, TypeScript, Tailwind CSS |
| **Backend** | FastAPI (Python), Pydantic |
| **Database** | MongoDB |
| **Authentication** | JWT (python-jose), bcrypt |
| **HTTP Client** | Axios |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB instance (local or Atlas)

### 1. Backend Setup

```bash
cd Booking/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string and settings

# Start the server
python main.py
```

Backend runs at `http://localhost:8000`

### 2. Frontend Setup (Customer App)

```bash
cd Booking/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at `http://localhost:3000`

### 3. Admin Portal Setup

```bash
cd Booking/admin

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin Portal runs at `http://localhost:3001`

### Quick Start Scripts

From the `Booking/` directory, you can use the convenience scripts:

```bash
# Start all servers
./start-servers.sh

# Or start individually
./start-backend.sh
./start-frontend.sh
./start-admin.sh
```

## ⚙️ Environment Variables

### Backend (.env)

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=booking_app

# JWT Authentication
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Default Owner (for customer association)
DEFAULT_OWNER_ID=your-owner-user-id

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

### Frontend & Admin (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
Booking/
├── backend/                    # FastAPI Backend
│   ├── core/                   # Core utilities
│   │   ├── mongo_helper.py     # MongoDB connection
│   │   └── security.py         # Auth utilities
│   ├── modules/                # Feature modules
│   │   ├── admin/              # Admin endpoints
│   │   ├── auth/               # Authentication
│   │   ├── availability/       # Slot management
│   │   ├── bookings/           # Booking operations
│   │   ├── notifications/      # Email service
│   │   ├── owners/             # Owner endpoints
│   │   └── profiles/           # Business profiles
│   ├── main.py                 # App entry point
│   └── requirements.txt
│
├── frontend/                   # Customer Frontend
│   └── src/
│       ├── app/                # Next.js pages
│       │   ├── book/           # Booking flow
│       │   ├── booking-lookup/ # Find booking
│       │   ├── my-bookings/    # User bookings
│       │   └── ...
│       ├── components/         # React components
│       ├── context/            # Auth context
│       ├── services/           # API client
│       └── types/              # TypeScript types
│
├── admin/                      # Admin Portal
│   └── src/
│       ├── app/                # Next.js pages
│       │   └── (dashboard)/    # Dashboard layout
│       │       ├── bookings/   # Booking management
│       │       ├── customers/  # Customer management
│       │       └── availability/ # Slot management
│       ├── components/         # React components
│       ├── context/            # Auth context
│       ├── services/           # API client
│       └── types/              # TypeScript types
│
└── README.md                   # This file
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user |

### Bookings (Customer)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | Get user's bookings |
| POST | `/bookings` | Create new booking |
| GET | `/bookings/{id}` | Get booking details |
| PUT | `/bookings/{id}/cancel` | Cancel booking |
| GET | `/bookings/lookup/{ref}` | Lookup by reference |

### Admin Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/bookings` | List all bookings (paginated) |
| GET | `/admin/bookings/{id}` | Get booking with details |
| PUT | `/admin/bookings/{id}/approve` | Approve booking |
| PUT | `/admin/bookings/{id}/reject` | Reject booking |
| PUT | `/admin/bookings/{id}/cancel` | Cancel booking |
| PUT | `/admin/bookings/{id}/complete` | Mark completed |
| PUT | `/admin/bookings/{id}/no-show` | Mark no-show |
| PUT | `/admin/bookings/{id}/reschedule` | Reschedule booking |
| POST | `/admin/bookings/{id}/notes` | Add admin note |

### Admin Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/customers` | List customers |
| GET | `/admin/customers/{id}` | Get customer details |
| GET | `/admin/customers/{id}/bookings` | Customer's bookings |
| PUT | `/admin/customers/{id}/block` | Block customer |
| PUT | `/admin/customers/{id}/unblock` | Unblock customer |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/availability/profiles/{id}` | Get availability slots |
| POST | `/availability/profiles/{id}/slots` | Create slots |
| GET | `/availability/templates` | Get slot templates |
| POST | `/availability/templates` | Create template |
| POST | `/availability/profiles/{id}/apply-template` | Apply template |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles` | List all profiles |
| GET | `/profiles/{id}` | Get profile details |
| GET | `/profiles/{id}/services` | Get services |

## 🔒 User Roles

| Role | Access |
|------|--------|
| **USER** | Customer booking features |
| **OWNER** | Admin portal, manage own business |
| **ADMIN** | Full system access |

## 📖 API Documentation

When the backend is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Style
- Backend: Python (Black, isort)
- Frontend/Admin: TypeScript (ESLint, Prettier)

## 📝 License

MIT License - feel free to use this project for your own booking applications.
