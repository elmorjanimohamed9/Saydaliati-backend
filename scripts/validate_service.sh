#!/bin/bash
cd /var/www/nestjs-app

# Check if PM2 process is running
if pm2 show nestjs-app | grep -q "online"; then
    echo "NestJS application is running"
    
    # Check if application responds
    if curl -s http://localhost:3000/health > /dev/null; then
        echo "Application health check passed"
        exit 0
    else
        echo "Application health check failed"
        exit 1
    fi
else
    echo "NestJS application is not running"
    exit 1
fi
