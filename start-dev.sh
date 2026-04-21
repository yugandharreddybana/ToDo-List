#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DEPLOYMENTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deployments"
UI_DIR="$DEPLOYMENTS_DIR/UI"
MIDDLEWARE_DIR="$DEPLOYMENTS_DIR/Middleware"
BACKEND_DIR="$DEPLOYMENTS_DIR/Backend"

print_header() {
  echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_status() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗ ERROR:${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠ WARNING:${NC} $1"
}

# Cleanup function
cleanup() {
  print_warning "Shutting down all services..."
  jobs -p | xargs kill 2>/dev/null || true
  wait 2>/dev/null || true
  print_status "All services stopped"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Check requirements
check_requirements() {
  print_header "CHECKING REQUIREMENTS"

  local missing=0

  if ! command -v node &> /dev/null; then
    print_error "Node.js not installed"
    missing=1
  else
    print_status "Node.js $(node --version)"
  fi

  if ! command -v npm &> /dev/null; then
    print_error "npm not installed"
    missing=1
  else
    print_status "npm $(npm --version)"
  fi

  if ! command -v java &> /dev/null; then
    print_error "Java not installed"
    missing=1
  else
    print_status "Java $(java -version 2>&1 | head -1)"
  fi

  if ! command -v mvn &> /dev/null; then
    print_error "Maven not installed"
    missing=1
  else
    print_status "Maven $(mvn --version | head -1)"
  fi

  # Check PostgreSQL (optional - can use Docker)
  if ! command -v psql &> /dev/null && ! command -v docker &> /dev/null; then
    print_warning "PostgreSQL client & Docker not found - database setup may fail"
  fi

  if [ $missing -eq 1 ]; then
    echo ""
    print_error "Install missing dependencies and try again"
    exit 1
  fi

  print_status "All requirements met!"
}

# Database setup
setup_database() {
  print_header "DATABASE SETUP"

  if command -v docker &> /dev/null; then
    if ! docker ps -a | grep -q todo-postgres; then
      print_status "Starting PostgreSQL container..."
      docker run -d \
        --name todo-postgres \
        -e POSTGRES_USER=todo_user \
        -e POSTGRES_PASSWORD=todo_password \
        -e POSTGRES_DB=todo_db \
        -p 5432:5432 \
        postgres:16-alpine 2>/dev/null || {
        print_error "Failed to start PostgreSQL"
        return 1
      }
      sleep 5
      print_status "PostgreSQL started"
    else
      print_status "PostgreSQL already running"
    fi
  else
    print_warning "Docker not available - ensure PostgreSQL is running on localhost:5432"
  fi
}

# Start Backend
start_backend() {
  print_header "STARTING BACKEND (Java Spring Boot)"

  if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    return 1
  fi

  cd "$BACKEND_DIR" || return 1

  print_status "Checking dependencies..."
  if [ ! -d "target" ]; then
    print_status "Building backend (this may take 2-3 minutes)..."
    if ! mvn clean install -q 2>/tmp/backend-build.log; then
      print_error "Backend build failed. Check /tmp/backend-build.log"
      cat /tmp/backend-build.log
      return 1
    fi
  fi

  print_status "Starting Spring Boot on port 8080..."
  nohup mvn spring-boot:run > /tmp/backend.log 2>&1 &
  local backend_pid=$!
  echo $backend_pid > /tmp/backend.pid

  sleep 3

  if ! ps -p $backend_pid > /dev/null 2>&1; then
    print_error "Backend failed to start"
    cat /tmp/backend.log
    return 1
  fi

  print_status "Backend started (PID: $backend_pid)"
}

# Start Middleware
start_middleware() {
  print_header "STARTING MIDDLEWARE (Node.js Express)"

  if [ ! -d "$MIDDLEWARE_DIR" ]; then
    print_error "Middleware directory not found: $MIDDLEWARE_DIR"
    return 1
  fi

  cd "$MIDDLEWARE_DIR" || return 1

  print_status "Checking node_modules..."
  if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    if ! npm install --silent 2>/tmp/middleware-install.log; then
      print_error "Failed to install middleware dependencies"
      cat /tmp/middleware-install.log
      return 1
    fi
  fi

  print_status "Building middleware..."
  if ! npm run build > /tmp/middleware-build.log 2>&1; then
    print_error "Middleware build failed"
    cat /tmp/middleware-build.log
    return 1
  fi

  print_status "Starting on port 4001..."
  nohup npm run dev > /tmp/middleware.log 2>&1 &
  local middleware_pid=$!
  echo $middleware_pid > /tmp/middleware.pid

  sleep 2

  if ! ps -p $middleware_pid > /dev/null 2>&1; then
    print_error "Middleware failed to start"
    cat /tmp/middleware.log
    return 1
  fi

  print_status "Middleware started (PID: $middleware_pid)"
}

# Start UI
start_ui() {
  print_header "STARTING UI (React/Vite)"

  if [ ! -d "$UI_DIR" ]; then
    print_error "UI directory not found: $UI_DIR"
    return 1
  fi

  cd "$UI_DIR" || return 1

  print_status "Checking node_modules..."
  if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    if ! npm install --silent 2>/tmp/ui-install.log; then
      print_error "Failed to install UI dependencies"
      cat /tmp/ui-install.log
      return 1
    fi
  fi

  print_status "Starting on port 3002..."
  nohup npm run dev > /tmp/ui.log 2>&1 &
  local ui_pid=$!
  echo $ui_pid > /tmp/ui.pid

  sleep 2

  if ! ps -p $ui_pid > /dev/null 2>&1; then
    print_error "UI failed to start"
    cat /tmp/ui.log
    return 1
  fi

  print_status "UI started (PID: $ui_pid)"
}

# Main
main() {
  print_header "TODO PRODUCTIVITY SUITE - LOCAL DEVELOPMENT"

  check_requirements
  setup_database

  print_header "STARTING ALL SERVICES"

  if ! start_backend; then
    print_error "Failed to start backend"
    exit 1
  fi

  sleep 5

  if ! start_middleware; then
    print_error "Failed to start middleware"
    kill $(cat /tmp/backend.pid 2>/dev/null) 2>/dev/null || true
    exit 1
  fi

  if ! start_ui; then
    print_error "Failed to start UI"
    kill $(cat /tmp/backend.pid 2>/dev/null) 2>/dev/null || true
    kill $(cat /tmp/middleware.pid 2>/dev/null) 2>/dev/null || true
    exit 1
  fi

  print_header "✓ ALL SERVICES RUNNING"

  echo -e "${GREEN}Frontend:${NC}   http://localhost:3002"
  echo -e "${GREEN}Middleware:${NC}  http://localhost:4001"
  echo -e "${GREEN}Backend:${NC}     http://localhost:8080/api"
  echo ""
  echo -e "${YELLOW}Logs:${NC}"
  echo "  Backend:    tail -f /tmp/backend.log"
  echo "  Middleware: tail -f /tmp/middleware.log"
  echo "  UI:         tail -f /tmp/ui.log"
  echo ""
  echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
  echo ""

  # Wait and monitor
  while true; do
    sleep 10

    backend_pid=$(cat /tmp/backend.pid 2>/dev/null)
    middleware_pid=$(cat /tmp/middleware.pid 2>/dev/null)
    ui_pid=$(cat /tmp/ui.pid 2>/dev/null)

    if [ -n "$backend_pid" ] && ! ps -p $backend_pid > /dev/null 2>&1; then
      print_error "Backend crashed"
    fi

    if [ -n "$middleware_pid" ] && ! ps -p $middleware_pid > /dev/null 2>&1; then
      print_error "Middleware crashed"
    fi

    if [ -n "$ui_pid" ] && ! ps -p $ui_pid > /dev/null 2>&1; then
      print_error "UI crashed"
    fi
  done
}

main
