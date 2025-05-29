#!/bin/bash
echo "Database Connection Test Tool"
echo "---------------------------"

# Load environment variables
source ./load-env.sh

# Display connection parameters (hide password)
echo "Using the following connection parameters:"
echo "DB_URL: $DB_URL"
echo "DB_USERNAME: $DB_USERNAME"
echo "Password: [HIDDEN]"

# Extract host and port from JDBC URL
# Format: jdbc:mysql://toandz.ddns.net:3306/fstudymate?...
DB_HOST=$(echo $DB_URL | sed -n 's/.*\/\/\([^:]*\).*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Extracted connection details:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"

echo -e "\nTesting connection with mysql command..."
# Try using mysql client
if command -v mysql &> /dev/null; then
  # Add quotes around the password to handle special characters
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" -e "SELECT 'Connection successful!' AS Result;" "$DB_NAME"
  MYSQL_EXIT_CODE=$?
  
  if [ $MYSQL_EXIT_CODE -eq 0 ]; then
    echo "MySQL client connection test: SUCCESS"
  else
    echo "MySQL client connection test: FAILED (exit code: $MYSQL_EXIT_CODE)"
    echo "This usually means either:"
    echo "  1. The MySQL user '$DB_USERNAME' doesn't have access from this server's IP"
    echo "  2. The password is incorrect"
    echo "  3. The database '$DB_NAME' doesn't exist"
  fi
else
  echo "MySQL client not found. Skipping direct test."
fi

echo -e "\nTesting connection with netcat..."
# Try using netcat to test TCP connectivity
if command -v nc &> /dev/null; then
  nc -zv "$DB_HOST" "$DB_PORT" -w 5
  NC_EXIT_CODE=$?
  
  if [ $NC_EXIT_CODE -eq 0 ]; then
    echo "Network connectivity test: SUCCESS (port is open)"
  else
    echo "Network connectivity test: FAILED (exit code: $NC_EXIT_CODE)"
    echo "This means the database server is not reachable on port $DB_PORT"
    echo "Check firewall settings or if the server is running"
  fi
else
  echo "Netcat not found. Skipping network test."
  
  # Try alternative with timeout
  if command -v timeout &> /dev/null && command -v telnet &> /dev/null; then
    echo "Trying telnet instead..."
    timeout 5 telnet "$DB_HOST" "$DB_PORT"
    TELNET_EXIT_CODE=$?
    
    if [ $TELNET_EXIT_CODE -eq 0 ]; then
      echo "Telnet test: SUCCESS (port is open)"
    else
      echo "Telnet test: FAILED (exit code: $TELNET_EXIT_CODE)"
    fi
  fi
fi

echo -e "\nCreating a simple Java test program..."
# Create a simple Java test program - ensure proper string escaping
mkdir -p test
cat > test/TestDbConnection.java << 'EOF'
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDbConnection {
    public static void main(String[] args) {
        // Get connection properties from environment variables
        String url = System.getenv("DB_URL");
        String username = System.getenv("DB_USERNAME");
        String password = System.getenv("DB_PASSWORD");
        
        if (url == null || username == null || password == null) {
            System.out.println("ERROR: Environment variables not properly set");
            System.out.println("DB_URL: " + (url != null ? url : "NOT SET"));
            System.out.println("DB_USERNAME: " + (username != null ? username : "NOT SET"));
            System.out.println("DB_PASSWORD: " + (password != null ? "SET (hidden)" : "NOT SET"));
            System.exit(1);
        }
        
        System.out.println("Attempting to connect to: " + url);
        System.out.println("Username: " + username);
        System.out.println("Password length: " + password.length());
        
        try {
            // Load the JDBC driver
            Class.forName("com.mysql.cj.jdbc.Driver");
            System.out.println("Driver loaded successfully");
            
            // Try connecting
            System.out.println("Attempting connection...");
            Connection connection = DriverManager.getConnection(url, username, password);
            
            if (connection != null) {
                System.out.println("Database connection successful!");
                connection.close();
            }
        } catch (ClassNotFoundException e) {
            System.out.println("Driver not found: " + e.getMessage());
            System.exit(2);
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
            System.out.println("SQLState: " + e.getSQLState());
            System.out.println("Error Code: " + e.getErrorCode());
            System.exit(3);
        }
    }
}
EOF

echo -e "\nCompiling and running Java test program..."
# Check if javac is available and compile the test program
if command -v javac &> /dev/null && command -v java &> /dev/null; then
  # Try to compile the test program
  javac test/TestDbConnection.java
  COMPILE_EXIT_CODE=$?
  
  if [ $COMPILE_EXIT_CODE -eq 0 ]; then
    echo "Compilation successful. Running test..."
    # Change to test directory and run the program
    cd test
    java TestDbConnection
    JAVA_EXIT_CODE=$?
    cd ..
    
    if [ $JAVA_EXIT_CODE -eq 0 ]; then
      echo "Java test completed successfully!"
    else
      echo "Java test failed with exit code: $JAVA_EXIT_CODE"
    fi
  else
    echo "Compilation failed with exit code: $COMPILE_EXIT_CODE"
  fi
else
  echo "Java not found. Skipping Java test."
fi

echo -e "\nTest complete."
echo -e "\nMySQL ACCESS SOLUTION:"
echo "If you're seeing 'Access denied' errors, you need to grant access to your MySQL user."
echo "Connect to your MySQL server and run:"
echo -e "\n    GRANT ALL PRIVILEGES ON fstudymate.* TO 'fstudy'@'42.113.247.211' IDENTIFIED BY 'your_password';"
echo "    FLUSH PRIVILEGES;"
echo -e "\nOr for any IP:"
echo -e "\n    GRANT ALL PRIVILEGES ON fstudymate.* TO 'fstudy'@'%' IDENTIFIED BY 'your_password';"
echo "    FLUSH PRIVILEGES;" 