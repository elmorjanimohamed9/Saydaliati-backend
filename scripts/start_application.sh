#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use LTS version
nvm use --lts

cd /var/www/nestjs-app

# Create .env file
./scripts/set-env.sh

# Load environment variables if exists
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found after creation!"
    exit 1
fi

# Stop existing process
pm2 stop nestjs-app 2>/dev/null || true
pm2 delete nestjs-app 2>/dev/null || true

# Start application
echo "Starting application with PM2..."
pm2 start dist/main.js --name nestjs-app

# Save PM2 configuration
pm2 save

# Enable PM2 startup script
pm2 startup systemd

# Wait for application to start
echo "Waiting for application to start..."
sleep 10

# Initial health check
echo "Performing health check..."
curl http://localhost:3000/health || exit 1

# Log successful deployment
echo "Application deployed successfully at $(date)"
