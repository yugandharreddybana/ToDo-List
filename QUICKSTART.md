# Quick Start Guide

## Prerequisites
- Node.js 20+
- Java 21+
- Maven 3.9+
- PostgreSQL 16+ (or Docker)

---

## 🏃 5-Minute Setup

### 1. Start Database (Docker)
```bash
docker run -d \
  --name todo-postgres \
  -e POSTGRES_USER=todo_user \
  -e POSTGRES_PASSWORD=todo_password \
  -e POSTGRES_DB=todo_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Run All Services
```bash
chmod +x start.sh
./start.sh
```

### 3. Access Application
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8080/api
- **Middleware**: http://localhost:3001

---

## 🐳 Docker One-Liner
```bash
docker-compose up -d
```

All services running in ~30 seconds. Access frontend at `http://localhost:3002`

---

## 📁 Deployment Structure

| Folder | Purpose | Tech |
|--------|---------|------|
| `deployments/UI` | Frontend application | React, Vite, TypeScript |
| `deployments/Middleware` | API gateway & business logic | Node.js, Express |
| `deployments/Backend` | Core data service | Java, Spring Boot |

---

## 🔍 Verify Everything Works

```bash
# Check Backend
curl http://localhost:8080/api/actuator/health

# Check Middleware
curl http://localhost:3001/health

# Check Frontend (should return HTML)
curl http://localhost:3002
```

All should return `healthy` or HTML content.

---

## 🆘 Issues?

**Port 3002 already in use?**
```bash
lsof -i :3002
kill -9 <PID>
```

**Database won't connect?**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Create database if needed
psql -U todo_user -d postgres -c "CREATE DATABASE todo_db;"
```

**Dependencies not installed?**
```bash
cd deployments/UI && npm install
cd deployments/Middleware && npm install
cd deployments/Backend && mvn install
```

---

## 📖 Full Documentation
See `DEPLOYMENT.md` for comprehensive deployment guide.
