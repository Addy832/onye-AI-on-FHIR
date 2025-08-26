@echo off
title AI on FHIR - Full Stack Server
echo ===========================================
echo      AI on FHIR Full Stack Server
echo ===========================================
echo.
echo Starting Backend Server...
echo Backend will be available at: http://localhost:5000
echo.
start "Backend Server" /d backend start.bat

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend Server...
echo Frontend will be available at: http://localhost:3000
echo.
start "Frontend Server" /d frontend npm run dev

echo.
echo ===========================================
echo    Both servers are starting up...
echo ===========================================
echo Backend:  http://localhost:5000/api/health
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

echo.
echo Stopping servers...
taskkill /f /im node.exe /t 2>nul
taskkill /f /im python.exe /t 2>nul
echo Servers stopped.
pause
