@echo off
echo Loading environment variables...

if not exist ".env" (
    echo ERROR: .env file not found
    echo Creating example .env file...
    echo # SMB Authentication > .env
    echo SMB_USERNAME=your_username >> .env
    echo SMB_PASSWORD=your_password >> .env
    echo.
    echo Created .env file. Please edit it with your actual SMB credentials.
    exit /b 1
)

for /f "tokens=1,* delims==" %%a in (.env) do (
    if not "%%a"=="" (
        if not "%%a:~0,1"=="#" (
            set "%%a=%%b"
            echo Set %%a
        )
    )
)

echo.
echo Environment variables loaded. Now you can run your application.
echo To test SMB connection, run: test-smb-connection.bat
echo. 