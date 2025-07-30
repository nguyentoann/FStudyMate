@echo off
echo ===================================================
echo FStudyMate Frontend Rebuild with API URL Fix
echo ===================================================

cd frontend

echo Stopping any running React dev servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Building frontend with updated API URL configuration...
call npm run build

echo Starting development server...
start cmd /c "npm start"

echo Frontend is rebuilding with API URL updated to port 8080.
echo Please wait for the development server to start and reload the application in your browser.

cd ..