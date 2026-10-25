# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Accept VITE build args (Vite bakes env vars at build time)
ARG VITE_API_BASE_URL=
ARG VITE_APP_NAME="Productivity Suite"
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

COPY package*.json ./
RUN npm ci --quiet

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
