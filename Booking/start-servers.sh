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
echo "🚀 Backend started on http://localhost:1301 (PID: $BACKEND_PID)"

# Start frontend in background
cd ../frontend
echo "🔧 Starting Next.js frontend..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install > /dev/null 2>&1
fi

npm run dev &
FRONTEND_PID=$!
echo "🚀 Frontend started on http://localhost:1401 (PID: $FRONTEND_PID)"

# Start admin portal in background
cd ../admin
echo "🔧 Starting Admin Portal..."
if [ ! -d "node_modules" ]; then
    echo "📦 Installing admin dependencies..."
    npm install > /dev/null 2>&1
fi

npm run dev &
ADMIN_PID=$!
echo "🚀 Admin Portal started on http://localhost:1302 (PID: $ADMIN_PID)"

echo ""
echo "🎉 Modern Booking App is running!"
echo "   Customer Frontend: http://localhost:1401"
echo "   Admin Portal:      http://localhost:1302"
echo "   Backend API:       http://localhost:1301"
echo "   API Docs:          http://localhost:1301/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $ADMIN_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM

# Wait for processes
wait
