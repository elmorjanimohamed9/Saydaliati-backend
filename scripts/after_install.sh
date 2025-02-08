#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Use LTS version
nvm use --lts

cd /var/www/nestjs-app

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build the application (if not already built)
if [ ! -d "dist" ]; then
    echo "Building application..."
    npm run build
fi

# Set permissions
sudo chown -R ec2-user:ec2-user /var/www/nestjs-app

# Verify Node.js version
echo "Using Node.js version:"
node --version
