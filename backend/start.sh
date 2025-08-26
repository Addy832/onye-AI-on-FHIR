#!/bin/bash

echo "==========================================="
echo "    AI on FHIR Backend Server"
echo "==========================================="
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt
echo ""
echo "Starting Flask server..."
echo "Server will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/api/health"
echo ""
python app.py
