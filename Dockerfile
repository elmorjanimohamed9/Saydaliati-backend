# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./

# Install dependencies with clean cache
RUN npm ci --omit=dev --prefer-offline --no-audit && \
    npm cache clean --force

COPY . .

# Build with verification
RUN npm run build && \
    ls -la dist && \
    test -f dist/main.js

# Clean build dependencies
RUN rm -rf node_modules && \
    npm cache clean --force

# Production stage
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production deps with clean cache
RUN npm ci --omit=dev --prefer-offline --no-audit && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/tmp/* /root/.npm

EXPOSE 3000
CMD ["node", "dist/main.js"]