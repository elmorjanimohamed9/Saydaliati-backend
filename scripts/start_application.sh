#!/bin/bash
cd /var/www/nestjs-app
npm install --production 
pm2 start main.js --name nestjs-app