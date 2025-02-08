#!/bin/bash

# Install NVM
echo "Installing NVM..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# Install Node.js LTS version
echo "Installing Node.js LTS..."
nvm install --lts
nvm use --lts

# Verify Node.js installation
echo "Node.js version:"
node --version
echo "NPM version:"
npm --version

# Install PM2 globally
echo "Installing PM2..."
npm install pm2 -g

# Create app directory
echo "Creating application directory..."
sudo mkdir -p /var/www/nestjs-app
cd /var/www/nestjs-app
sudo rm -rf *

# Set correct permissions
sudo chown -R ec2-user:ec2-user /var/www/nestjs-app

# Install necessary dependencies
echo "Installing additional dependencies..."
sudo yum install -y git

# Make NVM available for other scripts
echo "export NVM_DIR=\"$HOME/.nvm\"" >> ~/.bashrc
echo "[ -s \"$NVM_DIR/nvm.sh\" ] && \. \"$NVM_DIR/nvm.sh\"" >> ~/.bashrc
echo "[ -s \"$NVM_DIR/bash_completion\" ] && \. \"$NVM_DIR/bash_completion\"" >> ~/.bashrc

# Make sure the script completes successfully
echo "Before Install script completed"
