#!/bin/bash

echo "Starting Backend (Java Spring Boot)..."
echo "Port: 8080"
echo ""

cd "$(dirname "$0")/deployments/Backend" || exit 1

# Install deps if needed
if [ ! -d "target" ]; then
  echo "First build - installing dependencies (2-3 minutes)..."
  mvn clean install
fi

echo "Starting Spring Boot..."
mvn spring-boot:run
