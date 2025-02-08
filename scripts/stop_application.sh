#!/bin/bash

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2 || {
        echo "Failed to install PM2"
        exit 0
fi

# Stop application if it's running
if pm2 list | grep -q "nestjs-app"; then
    echo "Stopping existing application..."
    pm2 stop nestjs-app || true
    pm2 delete nestjs-app || true
    pm2 save || true
else
    echo "No existing application found to stop"
fi

# Always exit successfully to prevent first-time deployment failures
exit 0
