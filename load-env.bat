@echo off
echo Loading environment variables from .env file...

for /F "tokens=*" %%A in (.env) do (
    set %%A
)

echo Environment variables loaded successfully! 