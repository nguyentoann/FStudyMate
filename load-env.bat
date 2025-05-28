@echo off
echo Loading environment variables from .env file...

REM Set database config - using quotes to handle special characters
set "DB_URL=jdbc:mysql://toandz.ddns.net:3306/fstudymate?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true"
set "DB_USERNAME=fstudy"
set "DB_PASSWORD=toandz@secretpassword"

REM Set OpenAI config
set "OPENAI_API_KEY=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"

REM Set email config
set "EMAIL_USERNAME=cuutoan.nguyen@gmail.com"
set "EMAIL_PASSWORD=orkm adcb alkd uhqo"

echo Environment variables loaded successfully!
echo. 