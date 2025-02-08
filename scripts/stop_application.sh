#!/bin/bash

# Exit on error
set -e

# Load NVM if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo "Failed to install PM2"
        exit 1  # Changed from 0 to 1 to indicate error
    fi
fi

# Stop the application if it's running
if pm2 list | grep -q "nestjs-app"; then
    echo "Stopping existing application..."
    pm2 stop nestjs-app || true
    pm2 delete nestjs-app || true
    pm2 save || true
    echo "Application stopped successfully"
else
    echo "No existing application found to stop"
fi

# Clean up PM2 processes if needed
pm2 kill || true

# Exit successfully
echo "Stop script completed successfully"
exit 0