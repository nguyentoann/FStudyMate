@echo off
echo Loading environment variables and starting Spring Boot application...

call load-env.bat

echo Starting Spring Boot application with environment variables...
echo DB_URL=%DB_URL%
echo DB_USERNAME=%DB_USERNAME%
echo EMAIL_USERNAME=%EMAIL_USERNAME%
echo.

mvn spring-boot:run

echo Application stopped. 