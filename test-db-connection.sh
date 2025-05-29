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
    # Try to get more info about the error
    echo "Attempting to get more detailed error information..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_NAME" 2>&1 | grep -i "error"
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
  fi
else
  echo "Netcat not found. Skipping network test."
  # Try a simpler connection test with timeout
  echo "Trying alternative connection test with timeout..."
  timeout 5 bash -c "</dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "Network connectivity test: SUCCESS (port is open)"
  else
    echo "Network connectivity test: FAILED (could not connect to $DB_HOST:$DB_PORT)"
  fi
fi

echo -e "\nCreating a simple Java test program..."
# Create a simple Java test program - carefully handling the string literals
mkdir -p test
cat > test/TestDbConnection.java << 'EOF'
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class TestDbConnection {
    public static void main(String[] args) {
        // Get variables from environment to avoid string interpolation issues
        String url = System.getenv("DB_URL");
        String username = System.getenv("DB_USERNAME");
        String password = System.getenv("DB_PASSWORD");
        
        System.out.println("Attempting to connect to: " + url);
        System.out.println("Username: " + username);
        System.out.println("Password length: " + (password != null ? password.length() : 0));
        
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
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
            System.out.println("SQLState: " + e.getSQLState());
            System.out.println("Error Code: " + e.getErrorCode());
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
    java -DOPEN_API_KEY="$OPENAI_API_KEY" \
         -DDB_URL="$DB_URL" \
         -DDB_USERNAME="$DB_USERNAME" \
         -DDB_PASSWORD="$DB_PASSWORD" \
         TestDbConnection
    JAVA_EXIT_CODE=$?
    cd ..
    
    if [ $JAVA_EXIT_CODE -eq 0 ]; then
      echo "Java test completed."
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