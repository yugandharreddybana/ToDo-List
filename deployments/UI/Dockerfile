# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept VITE build args (Vite bakes env vars at build time)
ARG VITE_API_BASE_URL=http://localhost:3001
ARG VITE_APP_NAME="Productivity Suite"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci --quiet

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3002

ENV NODE_ENV=production

CMD ["serve", "-s", "dist", "-l", "3002"]
