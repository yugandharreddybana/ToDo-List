# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --quiet

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN npm install --omit=dev --quiet

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY .env .env

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
