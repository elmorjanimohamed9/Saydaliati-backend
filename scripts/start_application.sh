#!/bin/bash

# Exit on error
set -e

cd /var/www/nestjs-app

# Load NVM if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the application if needed
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi

# Verify dist/main.js exists
if [ ! -f "dist/main.js" ]; then
    echo "Error: dist/main.js not found!"
    exit 1
fi

# Start application
echo "Starting application with PM2..."
pm2 start dist/main.js --name nestjs-app || {
    echo "Failed to start application"
    exit 1
}

# Save PM2 configuration
pm2 save

# Wait for application to start
echo "Waiting for application to start..."
sleep 10

# Health check
if curl -s http://localhost:3000/health > /dev/null; then
    echo "Application started successfully"
    exit 0
else
    echo "Application failed to start"
    pm2 logs nestjs-app --lines 50
    exit 1
fi