#!/bin/bash

echo "Starting UI (React/Vite)..."
echo "Port: 3002"
echo ""

cd "$(dirname "$0")/deployments/UI" || exit 1

# Install deps if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Starting development server..."
npm run dev
