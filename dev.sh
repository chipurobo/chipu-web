#!/bin/bash

# Development Setup Script for ChipuRobo Project
echo "🚀 Starting ChipuRobo Development Environment"
echo "============================================="

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."

if ! command_exists pnpm; then
    echo "❌ pnpm is not installed. Please install it first:"
    echo "   npm install -g pnpm"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js"
    exit 1
fi

echo "✅ Dependencies check passed"

# Check environment files
echo "📋 Checking environment configuration..."

if [ ! -f ".env" ]; then
    echo "⚠️  Frontend .env file not found. Please configure it"
    echo "   Copy from .env.example and update values"
fi

if [ ! -f "cms/.env" ]; then
    echo "⚠️  CMS .env file not found. Please configure it"
    echo "   Copy from cms/.env.example and update values"
fi

# Check if we want to run both services
read -p "🔄 Do you want to run both CMS and Frontend? (y/n): " run_both

if [ "$run_both" = "y" ] || [ "$run_both" = "Y" ]; then
    echo "🏃‍♂️ Starting both services..."
    
    # Get current directory (project root)
    PROJECT_ROOT=$(pwd)
    
    # Start CMS in background
    echo "📦 Starting Payload CMS on http://localhost:3000..."
    cd "$PROJECT_ROOT/cms" && pnpm dev &
    CMS_PID=$!
    
    # Wait a moment for CMS to start
    sleep 3
    
    # Start frontend from project root
    echo "🎨 Starting Vite Frontend on http://localhost:5173..."
    cd "$PROJECT_ROOT" && npm run dev &
    FRONTEND_PID=$!
    
    echo "✨ Both services are starting!"
    echo "📦 CMS Admin: http://localhost:3000/admin"
    echo "🎨 Frontend: http://localhost:5173"
    echo ""
    echo "Press Ctrl+C to stop both services"
    
    # Handle cleanup
    trap "echo '🛑 Stopping services...'; kill $CMS_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
    
    # Wait for both processes
    wait
    
elif [ "$1" = "cms" ]; then
    echo "📦 Starting only Payload CMS on http://localhost:3000..."
    PROJECT_ROOT=$(pwd)
    cd "$PROJECT_ROOT/cms" && pnpm dev
    
elif [ "$1" = "frontend" ] || [ "$1" = "web" ]; then
    echo "🎨 Starting only Vite Frontend on http://localhost:5173..."
    npm run dev
    
else
    echo "💡 Usage options:"
    echo "   ./dev.sh           - Interactive mode"
    echo "   ./dev.sh cms       - Start only CMS"
    echo "   ./dev.sh frontend  - Start only frontend"
    echo ""
    echo "Individual commands:"
    echo "   cd cms && pnpm dev           # Start CMS"
    echo "   npm run dev                  # Start frontend"
fi