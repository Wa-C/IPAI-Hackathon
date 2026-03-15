#!/bin/bash
# AI Tutor — Quick Start
# Run this from the project root: ./start.sh

set -e

echo "============================================"
echo "  AI Tutor — Starting MVP"
echo "============================================"
echo ""

# Check for .env
if [ ! -f backend/.env ]; then
    echo "⚠  No backend/.env found. Creating from template..."
    cp backend/.env.example backend/.env
    echo "   → Edit backend/.env and add your ANTHROPIC_API_KEY"
    echo ""
fi

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo "🚀 Starting backend on http://localhost:8000"
uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

if [ ! -d "node_modules" ]; then
    npm install
fi

echo "🚀 Starting frontend on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "  ✅ AI Tutor is running!"
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  API docs:  http://localhost:8000/docs"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
