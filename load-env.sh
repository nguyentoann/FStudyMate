#!/bin/bash
echo "Loading environment variables from .env file..."

if [ -f .env ]; then
  # Fix line endings first to ensure proper parsing
  tr -d '\r' < .env > .env.tmp && mv .env.tmp .env
  
  # Read .env file line by line with proper handling of line endings
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^[[:space:]]*# && -n "$line" ]]; then
      # Extract variable name and value
      if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"
        
        # Remove leading/trailing whitespace
        var_name=$(echo "$var_name" | xargs)
        
        # Remove surrounding quotes if present
        var_value=$(echo "$var_value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
        
        # Export the variable
        export "$var_name"="$var_value"
        echo "Loaded: $var_name"
      else
        echo "Warning: Skipping invalid line: $line"
      fi
    fi
  done < .env
  
  echo "Environment variables loaded successfully!"
  
  # Debug output to verify (comment out in production)
  # echo "DB_URL: $DB_URL"
  # echo "DB_USERNAME: $DB_USERNAME"
  # echo "Password length: ${#DB_PASSWORD}"
else
  echo "Error: .env file not found!"
  exit 1
fi 