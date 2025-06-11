#!/bin/bash
cd /root/FStudyMate || exit

# Function to kill existing processes
kill_existing_processes() {
  echo "Stopping any existing application processes..."
  
  # Kill any running npm processes (frontend)
  pkill -f "node.*react-scripts start" || true
  
  # Kill any running Java/Maven processes (backend)
  pkill -f "spring-boot:run" || true
  pkill -f "java.*FStudyMate" || true
  
  # Give processes time to shutdown gracefully
  sleep 5
  
  # Force kill if still running
  pkill -9 -f "node.*react-scripts start" || true
  pkill -9 -f "spring-boot:run" || true
  pkill -9 -f "java.*FStudyMate" || true
  
  # Wait to ensure processes are terminated
  sleep 2
  
  echo "All existing processes stopped"
}

# Create pidfile directory if it doesn't exist
mkdir -p /var/run/fstudymate

# Fetch latest changes
git fetch origin main

# Check if local branch is behind remote
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "Changes detected, pulling latest..."
  git pull origin main
  
  # Kill existing processes before deploying
  kill_existing_processes
  
  # Make scripts executable
  chmod +x run-app.sh
  chmod +x load-env.sh
  
  # Run the application in a new session to avoid zombie processes
  nohup ./run-app.sh > /var/log/fstudymate.log 2>&1 &
  
  echo "Redeployment complete!"
else
  echo "No changes."
fi 