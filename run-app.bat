@echo off
echo Starting Vin Multiple Choice Application

echo Loading environment variables...
call load-env.bat

echo Starting Spring Boot backend with network access...
start cmd /k "cd target && java -jar -Dserver.address=0.0.0.0 vinmultiplechoice-0.0.1-SNAPSHOT.jar"

echo Wait for backend to start...
timeout /t 10

echo Starting React frontend...
cd frontend
start cmd /k "npm start"

echo Both applications are running!
echo Backend: http://localhost:8080 (accessible from other devices at http://YOUR_IP:8080)
echo Frontend: http://localhost:3000 