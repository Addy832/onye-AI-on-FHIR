#!/bin/bash
# AI on FHIR - Production Server Startup Script
# Starts both backend and frontend servers

set -e

echo "🚀 Starting AI on FHIR System..."
echo "=================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is available  
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "❌ Port $port is already in use"
        return 1
    fi
    return 0
}

# Check required ports
if ! check_port 5000; then
    echo "Please stop the service using port 5000 and try again"
    exit 1
fi

if ! check_port 3000; then
    echo "Please stop the service using port 3000 and try again"  
    exit 1
fi

echo "✅ System requirements check passed"
echo ""

# Start backend server
echo "🔧 Starting Backend Server..."
echo "------------------------------"
cd backend

# Install Python dependencies
if [ -f "requirements.txt" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Start backend in background
echo "🚀 Starting Flask API server on port 5000..."
python3 app.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend server started successfully (PID: $BACKEND_PID)"
else
    echo "❌ Failed to start backend server"
    exit 1
fi

cd ../frontend

# Start frontend server
echo ""
echo "🎨 Starting Frontend Server..."
echo "-------------------------------"

# Install Node.js dependencies
if [ -f "package.json" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting Next.js development server on port 3000..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    echo "✅ Frontend server started successfully (PID: $FRONTEND_PID)"
else
    echo "❌ Failed to start frontend server"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 AI on FHIR System Started Successfully!"
echo "=========================================="
echo ""
echo "📍 Access Points:"
echo "   🔗 Frontend UI: http://localhost:3000"
echo "   🔗 Backend API: http://localhost:5000"
echo "   🔗 API Health: http://localhost:5000/api/health"
echo ""
echo "🛑 To Stop Servers:"
echo "   Press Ctrl+C or run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📊 System Features:"
echo "   ✅ Natural Language Processing"
echo "   ✅ FHIR-Compliant Data Handling"
echo "   ✅ Clinical Risk Prediction"
echo "   ✅ Interactive Data Visualization"
echo "   ✅ HIPAA Security Compliance"
echo ""

# Keep script running to monitor servers
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

echo "🔄 Monitoring servers... (Press Ctrl+C to stop)"
wait
