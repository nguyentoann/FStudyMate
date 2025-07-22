@echo off
echo Starting FStudyMate with integrated IR control...

rem Set the profile to include IR remote functionality
set SPRING_PROFILES_ACTIVE=dev

rem Start the Spring Boot application
mvnw.cmd spring-boot:run

echo Application shutdown.
pause 