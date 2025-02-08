#!/bin/bash

# Create .env file
cat > .env << EOL
# Database settings
FIREBASE_PROJECT=${FIREBASE_PROJECT}
FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}

# AWS settings
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
AWS_S3_BUCKET_NAME=${AWS_S3_BUCKET_NAME}
AWS_REGION=${AWS_REGION}

# JWT settings
JWT_SECRET=${JWT_SECRET}

# EMAIL
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}
EMAIL_FROM=${EMAIL_FROM}
EOL

# Make sure the file was created
if [ ! -f .env ]; then
    echo "Failed to create .env file"
    exit 1
fi

# Set proper permissions
chmod 600 .env

echo "Environment file created successfully"
