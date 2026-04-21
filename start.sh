#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deployments"
UI_DIR="$DEPLOYMENTS_DIR/UI"
MIDDLEWARE_DIR="$DEPLOYMENTS_DIR/Middleware"
BACKEND_DIR="$DEPLOYMENTS_DIR/Backend"

# Port configuration
UI_PORT=3002
MIDDLEWARE_PORT=3001
BACKEND_PORT=8080

# Function to print colored output
print_status() {
  echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if directories exist
check_deployments() {
  if [ ! -d "$UI_DIR" ]; then
    print_error "UI deployment folder not found: $UI_DIR"
    exit 1
  fi
  if [ ! -d "$MIDDLEWARE_DIR" ]; then
    print_error "Middleware deployment folder not found: $MIDDLEWARE_DIR"
    exit 1
  fi
  if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend deployment folder not found: $BACKEND_DIR"
    exit 1
  fi
}

# Check if required tools are installed
check_requirements() {
  if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
  fi
  if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
  fi
  if ! command -v java &> /dev/null; then
    print_error "Java is not installed"
    exit 1
  fi
  if ! command -v mvn &> /dev/null; then
    print_error "Maven is not installed"
    exit 1
  fi
}

# Start Backend (Java Spring Boot)
start_backend() {
  print_status "Starting Backend (Spring Boot on port $BACKEND_PORT)..."

  cd "$BACKEND_DIR"

  # Check if dependencies are installed
  if [ ! -d "target" ]; then
    print_status "Building backend with Maven..."
    mvn clean install -q || {
      print_error "Failed to build backend"
      exit 1
    }
  fi

  mvn spring-boot:run &
  BACKEND_PID=$!
  print_status "Backend started (PID: $BACKEND_PID)"
}

# Start Middleware (Node.js Express)
start_middleware() {
  print_status "Starting Middleware (Express on port $MIDDLEWARE_PORT)..."

  cd "$MIDDLEWARE_DIR"

  # Check if node_modules exist
  if [ ! -d "node_modules" ]; then
    print_status "Installing Middleware dependencies..."
    npm install --quiet || {
      print_error "Failed to install middleware dependencies"
      exit 1
    }
  fi

  # Build TypeScript
  if [ ! -d "dist" ]; then
    print_status "Building Middleware..."
    npm run build || {
      print_error "Failed to build middleware"
      exit 1
    }
  fi

  npm run dev &
  MIDDLEWARE_PID=$!
  print_status "Middleware started (PID: $MIDDLEWARE_PID)"
}

# Start UI (React/Vite)
start_ui() {
  print_status "Starting UI (Vite on port $UI_PORT)..."

  cd "$UI_DIR"

  # Check if node_modules exist
  if [ ! -d "node_modules" ]; then
    print_status "Installing UI dependencies..."
    npm install --quiet || {
      print_error "Failed to install UI dependencies"
      exit 1
    }
  fi

  npm run dev &
  UI_PID=$!
  print_status "UI started (PID: $UI_PID)"
}

# Cleanup function
cleanup() {
  print_warning "Shutting down all services..."

  [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null || true
  [ -n "$MIDDLEWARE_PID" ] && kill $MIDDLEWARE_PID 2>/dev/null || true
  [ -n "$UI_PID" ] && kill $UI_PID 2>/dev/null || true

  print_status "All services stopped"
  exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Main execution
main() {
  print_status "========================================="
  print_status "Todo Productivity Suite - Full Stack"
  print_status "========================================="

  check_deployments
  check_requirements

  print_status "Starting all services..."

  # Start all services
  start_backend
  sleep 5  # Give backend time to start

  start_middleware
  sleep 3

  start_ui

  print_status "========================================="
  print_status "All services started successfully!"
  print_status "========================================="
  print_status "UI:         http://localhost:$UI_PORT"
  print_status "Middleware: http://localhost:$MIDDLEWARE_PORT"
  print_status "Backend:    http://localhost:$BACKEND_PORT"
  print_status "========================================="
  print_status "Press Ctrl+C to stop all services"
  print_status "========================================="

  # Wait for all background processes
  wait
}

main
