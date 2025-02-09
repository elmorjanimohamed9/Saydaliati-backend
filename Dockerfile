FROM node:20-alpine AS build

WORKDIR /app/

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

RUN test -f dist/src/main.js || (echo "❌ main.js not found at dist/src/main.js!" && exit 1)

#prod stage
FROM node:20-alpine

WORKDIR /app/

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /app/dist ./dist

COPY --from=build /app/package.json ./

RUN npm install --only=production

EXPOSE 3000

CMD ["node", "dist/main.js"]