#!/bin/bash

echo "==========================================="
echo "     AI on FHIR Full Stack Server"
echo "==========================================="
echo ""

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set trap to cleanup on exit
trap cleanup SIGINT SIGTERM

echo "Starting Backend Server..."
echo "Backend will be available at: http://localhost:5000"
cd backend
chmod +x start.sh
./start.sh &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to initialize..."
sleep 5

echo ""
echo "Starting Frontend Server..."  
echo "Frontend will be available at: http://localhost:3000"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "==========================================="
echo "   Both servers are running!"
echo "==========================================="
echo "Backend:  http://localhost:5000/api/health"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for user interrupt
wait
