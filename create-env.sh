#!/bin/bash
echo "FStudyMate Environment File Creator"
echo "=================================="
echo "This script will help you create a proper .env file with your database credentials."

# Check if .env already exists and ask for confirmation to overwrite
if [ -f .env ]; then
  read -p ".env file already exists. Do you want to overwrite it? (y/n): " overwrite
  if [ "$overwrite" != "y" ]; then
    echo "Operation cancelled."
    exit 0
  fi
fi

# Collect information
echo -e "\nPlease enter your database information:"
read -p "Database Host (e.g., localhost or toandz.ddns.net): " DB_HOST
read -p "Database Port (default: 3306): " DB_PORT
DB_PORT=${DB_PORT:-3306}
read -p "Database Name (default: fstudymate): " DB_NAME
DB_NAME=${DB_NAME:-fstudymate}
read -p "Database Username: " DB_USERNAME
read -sp "Database Password: " DB_PASSWORD
echo ""

# Construct JDBC URL
DB_URL="jdbc:mysql://$DB_HOST:$DB_PORT/$DB_NAME?useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true"

echo -e "\nPlease enter your OpenAI API key:"
read -p "OpenAI API Key: " OPENAI_API_KEY

echo -e "\nPlease enter your email configuration:"
read -p "Email Username: " EMAIL_USERNAME
read -sp "Email Password: " EMAIL_PASSWORD
echo ""

# Create .env file
cat > .env << EOF
# Database configuration
DB_URL=$DB_URL
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD

# OpenAI configuration 
OPENAI_API_KEY=$OPENAI_API_KEY

# Email configuration
EMAIL_USERNAME=$EMAIL_USERNAME
EMAIL_PASSWORD=$EMAIL_PASSWORD
EOF

echo -e "\n.env file created successfully!"
echo "You can test your database connection by running ./test-db-connection.sh" 