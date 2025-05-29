#!/bin/bash
echo "Loading environment variables from .env file..."

if [ -f .env ]; then
  # Read .env file line by line and handle special characters properly
  while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    if [[ ! "$line" =~ ^# && -n "$line" ]]; then
      # Extract variable name and value
      var_name="${line%%=*}"
      var_value="${line#*=}"
      
      # Remove surrounding quotes if present
      var_value="${var_value%\"}"
      var_value="${var_value#\"}"
      var_value="${var_value%\'}"
      var_value="${var_value#\'}"
      
      # Export the variable
      export "$var_name"="$var_value"
      echo "Loaded: $var_name"
    fi
  done < .env
  
  echo "Environment variables loaded successfully!"
else
  echo "Error: .env file not found!"
  exit 1
fi 