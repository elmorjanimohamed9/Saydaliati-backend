# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy all source files (ensure relevant files are included, check .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Optional: Verify the build output
RUN ls -l /app/dist

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets from build stage
COPY --from=build /app/dist ./dist
# Copy production package.json
COPY --from=build /app/package.json ./

# Install only production dependencies
RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]