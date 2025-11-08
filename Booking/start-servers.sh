#!/bin/bash

# Modern Booking App - Start Script
echo "🚀 Starting Modern Booking App..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check requirements
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ Node.js and npm are required but not installed."
    exit 1
fi

# Start backend in background
echo "🔧 Starting FastAPI backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend dependencies installed"

python main.py &
BACKEND_PID=$!
echo "🚀 Backend started on http://localhost:8000 (PID: $BACKEND_PID)"

# Start frontend in background
cd ../frontend
echo "🔧 Starting Next.js frontend..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi

npm run dev &
FRONTEND_PID=$!
echo "🚀 Frontend started on http://localhost:3000 (PID: $FRONTEND_PID)"

echo ""
echo "🎉 Modern Booking App is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes
wait