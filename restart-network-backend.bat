@echo off
echo Restarting backend with CORS fixes for phone access

echo Stopping any running Java processes...
taskkill /F /IM java.exe > nul 2>&1

echo Starting Spring Boot backend with network access...
echo This backend will be accessible from other devices including your phone

echo Your network IP address is:
ipconfig | findstr /i "IPv4"

echo.
echo Your backend will be accessible at http://YOUR_IP:8080
echo.

cd target
start cmd /k "java -jar -Dserver.address=0.0.0.0 -Dlogging.level.org.springframework.web.cors=TRACE vinmultiplechoice-0.0.1-SNAPSHOT.jar"

echo.
echo Backend restarted with CORS debugging enabled
echo Check the console output for CORS-related messages
echo.
pause 