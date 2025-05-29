#!/bin/bash
echo "Loading environment variables from .env file..."

if [ -f .env ]; then
  # Read .env file line by line to avoid issues with special characters
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^[[:space:]]*# && -n "$line" ]]; then
      # Extract variable name and value, accounting for possible spaces around =
      if [[ "$line" =~ ^[[:space:]]*([^[:space:]=#]+)[[:space:]]*=[[:space:]]*(.*) ]]; then
        var_name="${BASH_REMATCH[1]}"
        var_value="${BASH_REMATCH[2]}"
        
        # Remove surrounding quotes if present
        var_value="${var_value#\"}"
        var_value="${var_value%\"}"
        var_value="${var_value#\'}"
        var_value="${var_value%\'}"
        
        # Export the variable
        export "$var_name"="$var_value"
        echo "Loaded: $var_name"
      fi
    fi
  done < .env
  
  echo "Environment variables loaded successfully!"
else
  echo "Error: .env file not found!"
  exit 1
fi 