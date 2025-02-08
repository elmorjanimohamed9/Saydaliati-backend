#!/bin/bash
cd /var/www/nestjs-app

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use LTS version
nvm use --lts

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Verify the build
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found after build!"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

if [ ! -f "dist/main.js" ]; then
    echo "Error: dist/main.js not found after build!"
    echo "dist directory contents:"
    ls -la dist/
    exit 1
fi

# Create .env file
./scripts/set-env.sh

# Set permissions
sudo chown -R ec2-user:ec2-user /var/www/nestjs-app
sudo chmod -R 755 /var/www/nestjs-app