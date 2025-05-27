#!/bin/bash

# Create React app using create-react-app
echo "Setting up React frontend..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "Creating React app..."
    npx create-react-app frontend
else
    echo "Frontend directory already exists."
fi

# Copy all our prepared files
echo "Copying prepared files..."
cp -r frontend/src/* frontend/src/
cp -r frontend/public/* frontend/public/

# Install dependencies
echo "Installing dependencies..."
cd frontend && npm install axios react-router-dom tailwindcss postcss autoprefixer

# Initialize Tailwind CSS
echo "Setting up Tailwind CSS..."
cd frontend && npx tailwindcss init -p

# Build the app
echo "Building the React app..."
cd frontend && npm run build

echo "React frontend setup complete! Run 'cd frontend && npm start' to start the development server." 