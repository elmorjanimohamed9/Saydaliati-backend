#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  || {
    echo "NVM not found, continuing anyway..."
}

cd /var/www/nestjs-app || {
    echo "Failed to change directory"
    exit 1
}

# Create .env file
./scripts/set-env.sh || {
    echo "Failed to create .env file"
    exit 1
}

# Ensure PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop any existing process
pm2 stop nestjs-app 2>/dev/null || true
pm2 delete nestjs-app 2>/dev/null || true

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

# Health check with retry
MAX_RETRIES=3
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "Application started successfully"
        exit 0
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    echo "Health check failed, attempt $RETRY_COUNT of $MAX_RETRIES"
    sleep 5
done

echo "Application failed to start properly"
exit 1
