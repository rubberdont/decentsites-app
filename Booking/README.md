# Modern Booking App

An elegant modern booking application built with Next.js frontend and FastAPI backend.

## Features

### 1. Business Profile Management
- Create and edit business information
- Upload business image and description
- Modern, responsive interface

### 2. Service Management
- Add, edit, and delete services
- Each service includes:
  - Title and description
  - Price
  - Optional image
- Real-time CRUD operations

### 3. Customer View
- Public-facing business profile display
- Professional service showcase
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: FastAPI (Python)
- **HTTP Client**: Axios
- **Icons**: Heroicons

## Quick Start

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Booking/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Booking/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

## API Documentation

When the FastAPI backend is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### API Endpoints

- `GET /profiles/{profile_id}` - Get business profile
- `POST /profiles` - Create business profile
- `PUT /profiles/{profile_id}` - Update business profile
- `GET /profiles/{profile_id}/services` - Get services for a profile
- `POST /profiles/{profile_id}/services` - Add service to profile
- `PUT /profiles/{profile_id}/services/{service_id}` - Update service
- `DELETE /profiles/{profile_id}/services/{service_id}` - Delete service

## Usage

1. **Home Page**: Navigate between business profile management and customer view
2. **Profile Page**: Create/edit your business profile and manage services
3. **Customer View**: See how customers will view your business profile

## Development

### Frontend Structure
```
frontend/src/app/
├── page.tsx              # Home page
├── profile/page.tsx      # Business profile management
├── customer-view/page.tsx # Customer-facing view
└── globals.css           # Global styles
```

### Backend Structure
```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
└── venv/               # Virtual environment
```

## Features in Detail

### Profile Management
- Intuitive form-based interface
- Real-time saving and validation
- Image URL support for business branding

### Service Management
- Add services with rich details
- Edit existing services inline
- Delete services with confirmation
- Professional service cards display

### Customer Experience
- Clean, professional business profile display
- Service browsing with pricing
- Call-to-action buttons for booking
- Responsive design for mobile and desktop

## Customization

The app uses Tailwind CSS for styling, making it easy to customize:
- Modify color schemes in component classes
- Adjust spacing and layout
- Add custom components
- Extend functionality

## Production Deployment

### Backend
- Use a production WSGI server like Gunicorn
- Set up a proper database (PostgreSQL, MySQL)
- Configure environment variables
- Set up CORS for your domain

### Frontend
- Build the production version: `npm run build`
- Deploy to Vercel, Netlify, or your preferred platform
- Update API endpoints for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own booking applications.