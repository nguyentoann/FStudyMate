@echo off
echo Testing SMB connection...
echo.

echo Current environment variables:
echo SMB_USERNAME: %SMB_USERNAME%
echo SMB_PASSWORD: %SMB_PASSWORD% (showing only if set)
echo.

echo Attempting to list files on SMB server...
if "%SMB_USERNAME%"=="" (
    echo ERROR: SMB_USERNAME not set!
    echo Please make sure you load the environment variables first with: load-env.bat
    exit /b 1
)

if "%SMB_PASSWORD%"=="" (
    echo ERROR: SMB_PASSWORD not set!
    echo Please make sure you load the environment variables first with: load-env.bat
    exit /b 1
)

net use \\toandz.ddns.net\SWP391 /USER:%SMB_USERNAME% %SMB_PASSWORD%
if %errorlevel% neq 0 (
    echo Failed to connect to SMB server!
    exit /b 1
)

echo Connection succeeded!
echo.

echo Checking for ChatFiles directory...
if not exist "\\toandz.ddns.net\SWP391\ChatFiles" (
    echo ChatFiles directory does not exist, attempting to create...
    mkdir "\\toandz.ddns.net\SWP391\ChatFiles"
    if %errorlevel% neq 0 (
        echo Failed to create ChatFiles directory!
    ) else (
        echo Successfully created ChatFiles directory.
    )
) else (
    echo ChatFiles directory exists.
)

echo.
echo Directories on SMB server:
dir "\\toandz.ddns.net\SWP391"

echo.
echo Disconnecting...
net use \\toandz.ddns.net\SWP391 /delete 