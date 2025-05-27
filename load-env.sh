#!/bin/bash
echo "Loading environment variables from .env file..."

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Environment variables loaded successfully!"
else
  echo "Error: .env file not found!"
  exit 1
fi 