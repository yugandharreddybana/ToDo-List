# syntax=docker/dockerfile:1.6
# Build context: repo root (needs workspaces + shared package)

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/middleware/package.json packages/middleware/
COPY packages/frontend/package.json packages/frontend/
RUN npm ci --ignore-scripts

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/middleware/node_modules ./packages/middleware/node_modules
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY packages/middleware ./packages/middleware
RUN npm run build -w @tps/middleware

FROM node:20-alpine AS runtime
RUN apk add --no-cache wget
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/packages/middleware/package.json ./packages/middleware/package.json
COPY --from=build /app/packages/middleware/dist ./packages/middleware/dist
RUN npm ci --omit=dev --workspace=@tps/middleware --include-workspace-root --ignore-scripts \
 && npm cache clean --force
EXPOSE 3001
WORKDIR /app/packages/middleware
CMD ["node", "dist/index.js"]
