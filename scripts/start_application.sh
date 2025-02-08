#!/bin/bash
cd /var/www/nestjs-app

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use LTS version
nvm use --lts

# Verify dist directory and main.js
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found!"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

if [ ! -f "dist/main.js" ]; then
    echo "Error: dist/main.js not found!"
    echo "dist directory contents:"
    ls -la dist/
    exit 1
fi

# Stop existing process
pm2 stop nestjs-app 2>/dev/null || true
pm2 delete nestjs-app 2>/dev/null || true

# Start application
echo "Starting application with PM2..."
PM2_HOME="/home/ec2-user/.pm2" pm2 start dist/main.js --name nestjs-app

# Save PM2 configuration
PM2_HOME="/home/ec2-user/.pm2" pm2 save

# Wait for application to start
sleep 10

# Health check
if curl -s http://localhost:3000/health > /dev/null; then
    echo "Application started successfully"
    exit 0
else
    echo "Application failed to start"
    echo "PM2 logs:"
    pm2 logs nestjs-app --lines 50
    exit 1
fi
