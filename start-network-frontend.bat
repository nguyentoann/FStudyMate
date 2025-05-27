@echo off
echo Starting React frontend with network access...
echo Your frontend will be accessible from other devices on your network
echo.

REM Get the local IP address to display to the user
ipconfig | findstr /i "IPv4"
echo.
echo Frontend will be accessible at http://YOUR_IP:3000
echo.

REM Navigate to frontend directory
cd frontend

REM Start React development server using the start-network script
npm run start-network

pause 