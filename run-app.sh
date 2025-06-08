#!/bin/bash
echo "Starting FStudyMate Application"

# Create directory for PID files if it doesn't exist
PID_DIR="/var/run/fstudymate"
mkdir -p $PID_DIR

# Function to cleanup on exit
cleanup() {
  echo "Stopping application..."
  
  # Kill backend if running
  if [ -f "$PID_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$PID_DIR/backend.pid")
    if ps -p "$BACKEND_PID" > /dev/null; then
      echo "Stopping backend process..."
      kill "$BACKEND_PID" 2>/dev/null || true
      sleep 2
      kill -9 "$BACKEND_PID" 2>/dev/null || true
    fi
    rm -f "$PID_DIR/backend.pid"
  fi
  
  # Kill frontend if running
  if [ -f "$PID_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PID_DIR/frontend.pid")
    if ps -p "$FRONTEND_PID" > /dev/null; then
      echo "Stopping frontend process..."
      kill "$FRONTEND_PID" 2>/dev/null || true
      sleep 2
      kill -9 "$FRONTEND_PID" 2>/dev/null || true
    fi
    rm -f "$PID_DIR/frontend.pid"
  fi
  
  echo "Application stopped"
  exit 0
}

# Register cleanup function on exit
trap cleanup EXIT INT TERM

echo "Loading environment variables..."
source ./load-env.sh

echo "Starting Spring Boot backend with network access..."
# Run maven in background
mvn spring-boot:run &
BACKEND_PID=$!
echo $BACKEND_PID > "$PID_DIR/backend.pid"

echo "Wait for backend to start..."
sleep 3

echo "Starting React frontend..."
cd frontend
npm start &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PID_DIR/frontend.pid"

echo "Both applications are running!"
echo "Backend: http://localhost:8080 (accessible from other devices at http://YOUR_IP:8080)"
echo "Frontend: http://localhost:3000"

# Create a heartbeat function to keep checking if processes are alive
while true; do
  # Check if backend is running
  if ! ps -p "$BACKEND_PID" > /dev/null; then
    echo "Backend process died, shutting down application"
    cleanup
  fi
  
  # Check if frontend is running
  if ! ps -p "$FRONTEND_PID" > /dev/null; then
    echo "Frontend process died, shutting down application"
    cleanup
  fi
  
  # Sleep for 30 seconds before next check
  sleep 30
done 