@echo off
echo Starting FStudyMate Application

echo Loading environment variables...
call load-env.bat

echo Starting Spring Boot backend with network access...
start cmd /k "mvn spring-boot:run"

echo Wait for backend to start...
timeout /t 5

echo Starting React frontend...
cd frontend
start cmd /k "npm start"

echo Both applications are running!
echo Backend: http://localhost:8080 (accessible from other devices at http://YOUR_IP:8080)
echo Frontend: http://localhost:3000 