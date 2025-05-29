#!/bin/bash
echo "MySQL Remote Access Configuration Tool"
echo "===================================="
echo "This script will help you configure MySQL to allow remote access from your server IP."

# Get server's public IP
SERVER_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipinfo.io/ip)
if [ -z "$SERVER_IP" ]; then
  echo "ERROR: Could not determine server IP address."
  echo "Please enter your server IP address manually:"
  read -p "Server IP: " SERVER_IP
fi

echo "Your server IP appears to be: $SERVER_IP"
read -p "Continue with this IP? (y/n): " CONFIRM_IP
if [ "$CONFIRM_IP" != "y" ]; then
  read -p "Enter the correct server IP: " SERVER_IP
fi

# Load environment variables to get database credentials
if [ -f .env ]; then
  source ./load-env.sh
else
  echo "ERROR: .env file not found!"
  exit 1
fi

# Collect MySQL root credentials
echo "To grant access, you need MySQL root credentials for the database server."
read -p "MySQL Root Username [root]: " MYSQL_ROOT
MYSQL_ROOT=${MYSQL_ROOT:-root}
read -sp "MySQL Root Password: " MYSQL_ROOT_PASSWORD
echo ""

# Confirm MySQL host
echo "Using database host: $DB_HOST"
echo "Using database port: $DB_PORT"
read -p "Is this correct? (y/n): " CONFIRM_HOST
if [ "$CONFIRM_HOST" != "y" ]; then
  read -p "Enter the correct database host: " DB_HOST
  read -p "Enter the correct database port [3306]: " DB_PORT_INPUT
  DB_PORT=${DB_PORT_INPUT:-3306}
fi

# Generate SQL commands for fixing permissions
cat > grant-permissions.sql << EOF
-- Grant permissions for the specific IP
CREATE USER IF NOT EXISTS '$DB_USERNAME'@'$SERVER_IP' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USERNAME'@'$SERVER_IP';

-- Alternative: Grant access from any IP (less secure but more flexible)
CREATE USER IF NOT EXISTS '$DB_USERNAME'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USERNAME'@'%';

-- Apply the changes
FLUSH PRIVILEGES;
EOF

echo "SQL commands have been generated in grant-permissions.sql"
echo ""

# Execute the SQL commands
echo "Do you want to execute these commands now? (requires mysql client)"
read -p "Execute now? (y/n): " EXECUTE_NOW
if [ "$EXECUTE_NOW" = "y" ]; then
  if command -v mysql &> /dev/null; then
    echo "Executing SQL commands..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$MYSQL_ROOT" -p"$MYSQL_ROOT_PASSWORD" < grant-permissions.sql
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
      echo "MySQL permissions updated successfully!"
    else
      echo "Failed to update MySQL permissions (exit code: $EXIT_CODE)"
    fi
  else
    echo "MySQL client not found. You'll need to run these commands manually."
  fi
fi

echo ""
echo "MANUAL INSTRUCTIONS:"
echo "If you couldn't execute the commands automatically, connect to your MySQL server and run:"
echo "-----------------------------------------------------"
cat grant-permissions.sql
echo "-----------------------------------------------------"
echo ""
echo "After applying these changes, run ./test-db-connection.sh again to verify access." 