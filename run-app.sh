#!/bin/bash
echo "Starting FStudyMate Application"

echo "Loading environment variables..."
source ./load-env.sh

echo "Starting Spring Boot backend with network access..."
# Run maven in background
mvn spring-boot:run &
BACKEND_PID=$!

echo "Wait for backend to start..."
sleep 10

echo "Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

echo "Both applications are running!"
echo "Backend: http://localhost:8080 (accessible from other devices at http://YOUR_IP:8080)"
echo "Frontend: http://localhost:3000"

# Wait for either process to exit
wait $BACKEND_PID $FRONTEND_PID 