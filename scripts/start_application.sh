#!/bin/bash
cd /var/www/nestjs-app
pm2 stop all
pm2 start dist/main.js --name nestjs-app