@echo off
echo Starting Vin Multiple Choice Application with NETWORK ACCESS
echo.

echo Loading environment variables...
call load-env.bat
echo.

echo Displaying your network IP address:
ipconfig | findstr /i "IPv4"
echo.
echo Use the IP address above to access the application from other devices.
echo.

echo Starting Spring Boot backend with network access...
start cmd /k "cd target && java -jar -Dserver.address=0.0.0.0 vinmultiplechoice-0.0.1-SNAPSHOT.jar"

echo Wait for backend to start...
timeout /t 10

echo Starting React frontend with network access...
cd frontend
start cmd /k "npm run start-network"

echo Both applications are running!
echo Backend: http://YOUR_IP:8080
echo Frontend: http://YOUR_IP:3000
echo.
echo Your application is now accessible from other devices on your network.
echo.
pause 