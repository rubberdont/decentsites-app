#!/bin/bash
set -e

echo "📝 Generating .env files from .env.example templates..."

# Backend .env
if [ -f "Booking/backend/.env.example" ]; then
  cp Booking/backend/.env.example Booking/backend/.env
  # Replace placeholders with secrets
  sed -i "s|your-mongodb-uri-here|${MONGODB_URI}|g" Booking/backend/.env
  sed -i "s|your-owner-id-here|${DEFAULT_OWNER_ID}|g" Booking/backend/.env
  echo "✓ Backend .env created"
fi

# Frontend .env.local
if [ -f "Booking/frontend/.env.example" ]; then
  cp Booking/frontend/.env.example Booking/frontend/.env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:1301" > Booking/frontend/.env.local
  echo "✓ Frontend .env.local created"
fi

# Admin .env.local
if [ -f "Booking/admin/.env.example" ]; then
  cp Booking/admin/.env.example Booking/admin/.env.local
  echo "✓ Admin .env.local created"
fi

echo "✓ Environment files generated successfully"