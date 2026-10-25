# Todo Productivity Suite - Full Stack Application

Full-stack, AI-assisted daily planning and focus tracking. Users review and approve a proposed schedule; the planner does not silently change an active plan.

**Stack:** React/Vite • TypeScript • Express • Java Spring Boot • PostgreSQL

---

## 📁 Project Structure

```
.
├── deployments/
│   ├── UI/              # React/Vite Frontend (port 3002)
│   ├── Middleware/      # Node.js Express API (port 3001)
│   └── Backend/         # Java Spring Boot Service (port 8080)
├── packages/shared/     # Shared TypeScript types
├── start-dev.sh         # Run all services (Linux/Mac)
├── start-dev.bat        # Run all services (Windows)
├── docker-compose.yml   # Docker deployment
├── SETUP.md            # Getting started
├── DEPLOYMENT.md       # Full deployment guide
└── TROUBLESHOOTING.md  # Fix common issues
```

---

## 🚀 Quick Start

### Docker Compose
```bash
cp .env.example .env
# Set POSTGRES_PASSWORD, JWT_ACCESS_SECRET (at least 32 random characters),
# and NVIDIA_API_KEY in .env before starting.
docker compose up --build -d
```
Open http://localhost:3002. Frontend API requests use the same origin and are proxied to the middleware. The backend and database are private to the Compose network. For a public domain, set `MIDDLEWARE_CORS_ORIGIN` to its exact HTTPS origin and terminate TLS at a trusted proxy.

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3002 | React UI |
| **Middleware** | http://localhost:3001 | Node.js API |
| **Backend** | internal in Docker Compose; http://localhost:8080/api when run locally | Java REST API |

---

## ✅ Verify Setup

```bash
curl http://localhost:3001/health
curl http://localhost:3002
# For a locally run backend only:
curl http://localhost:8080/api/actuator/health
```

---

## 📋 Prerequisites

- Node.js 20+
- Java 21+
- Maven 3.9+
- PostgreSQL 16+
- Docker Compose (recommended); local development additionally needs PostgreSQL 16+

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Fix common issues

---

## 🚢 Deployment Folders

| Folder | Tech | Port |
|--------|------|------|
| `deployments/UI` | React/Vite | 3002 |
| `deployments/Middleware` | Node.js/Express | 3001 |
| `deployments/Backend` | Java Spring Boot | 8080 |

Each folder is self-contained and ready for deployment.

---

## 📊 Tech Stack

**Frontend:** React 19, TypeScript, Vite, TailwindCSS
**Middleware:** Node.js, Express, TypeScript, JWT
**Backend:** Java 21, Spring Boot 3.3, PostgreSQL
**Database:** PostgreSQL 16 (schema: `todo_list`)

---

## ✨ Features

- ✅ CRUD operations for todos
- ✅ User authentication & profiles
- ✅ Goal tracking
- ✅ Health metrics
- ✅ Focus sessions (Pomodoro)
- ✅ AI-powered assistance
- ✅ In-app notifications (polled), including behind-plan replan suggestions
- ✅ Actual-time focus analytics and on-demand AI reports
- ✅ User-local daily, weekly, and monthly AI report notifications when NVIDIA is configured
- ✅ Fixed commitments and roster shifts in daily proposals

---

Before an internet-facing release, configure TLS, backups, monitoring, a real NVIDIA key, and rotate any credentials previously committed to Git history. Historical Career CRM tables remain in old Flyway migrations to preserve production migration checksums and existing data; active Career CRM routes and UI are removed. See [DEPLOYMENT.md](./DEPLOYMENT.md) for operational guidance.
