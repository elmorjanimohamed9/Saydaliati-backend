FROM node:20-alpine AS build

WORKDIR /app/

# Copy both package.json and package-lock.json
COPY package*.json ./

# Use npm ci for cleaner, more reliable builds
RUN npm ci

COPY . .

RUN npm run build

#prod stage
FROM node:20-alpine

WORKDIR /app/

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Copy both package files for proper dependency installation
COPY --from=build /app/package*.json ./

# Copy the dist folder
COPY --from=build /app/dist ./dist

# Use npm ci instead of npm install for production dependencies
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]