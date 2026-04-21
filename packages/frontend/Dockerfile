# syntax=docker/dockerfile:1.6
# Build context: repo root

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/middleware/package.json packages/middleware/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci --ignore-scripts

FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:3001/api
ARG VITE_APP_NAME="Productivity Suite"
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend
RUN npm run build -w @tps/frontend

FROM nginx:1.27-alpine AS runtime
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
