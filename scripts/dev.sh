#!/usr/bin/env bash
# Start Postgres + Redis + backend in Docker, frontend + middleware locally (hot reload).
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "error: .env not found at repo root. Copy .env.example and fill in secrets." >&2
  exit 1
fi

set -a; . ./.env; set +a

: "${JWT_ACCESS_SECRET:?JWT_ACCESS_SECRET must be set in .env}"
: "${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET must be set in .env}"

echo "▶ starting postgres, redis, backend in docker…"
docker compose up -d postgres redis backend

echo "▶ waiting for backend (http://localhost:8080/actuator/health)…"
for i in {1..60}; do
  if curl -sf http://localhost:8080/actuator/health >/dev/null 2>&1; then
    echo "✔ backend ready"
    break
  fi
  sleep 2
  if [[ $i -eq 60 ]]; then
    echo "✖ backend failed to start within 2 minutes" >&2
    docker compose logs --tail=50 backend
    exit 1
  fi
done

echo "▶ starting frontend (:3000) + middleware (:3001) in watch mode…"
exec npm run dev
