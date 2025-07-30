@echo off
echo ===================================================
echo FStudyMate Application Restart with Header Size Fixes
echo ===================================================

echo Stopping running instances...
taskkill /f /im java.exe

echo Building application...
call mvn clean package -DskipTests

echo Starting application with increased header size...
start java -jar -Dserver.max-http-header-size=64KB -Dserver.tomcat.max-http-header-size=64KB target/FStudyMate-0.0.1-SNAPSHOT.jar

echo Application is starting with header size fixes applied.
echo Check the console for startup progress.