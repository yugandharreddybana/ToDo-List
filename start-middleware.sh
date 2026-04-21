#!/bin/bash

echo "Starting Middleware (Node.js Express)..."
echo "Port: 3001"
echo ""

cd "$(dirname "$0")/deployments/Middleware" || exit 1

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build if needed
if [ ! -d "dist" ]; then
  echo "Building TypeScript..."
  npm run build
fi

echo "Starting development server..."
npm run dev
