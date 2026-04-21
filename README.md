# Todo Productivity Suite - Full Stack Application

Complete full-stack todo management application with real-time sync, AI assistance, and productivity tracking.

**Stack:** React • Next.js • TypeScript • Node.js • Java Spring Boot • PostgreSQL

---

## 📁 Project Structure

```
.
├── deployments/
│   ├── UI/              # React/Vite Frontend (port 3002)
│   ├── Middleware/      # Node.js Express API (port 3001)
│   └── Backend/         # Java Spring Boot Service (port 8080)
├── packages/
│   ├── frontend/        # Original frontend source
│   ├── middleware/      # Original middleware source
│   └── shared/          # Shared TypeScript types
├── services/
│   └── backend/         # Original backend source
├── start-dev.sh         # Run all services (Linux/Mac)
├── start-dev.bat        # Run all services (Windows)
├── docker-compose.yml   # Docker deployment
├── SETUP.md            # Getting started
├── DEPLOYMENT.md       # Full deployment guide
└── TROUBLESHOOTING.md  # Fix common issues
```

---

## 🚀 Quick Start

### Automatic (All Services)
```bash
# Linux/Mac
chmod +x start-dev.sh
./start-dev.sh

# Windows
start-dev.bat
```

### Manual (Separate Terminals)
```bash
./start-backend.sh    # Terminal 1
./start-middleware.sh # Terminal 2
./start-ui.sh        # Terminal 3
```

### Docker
```bash
docker-compose up -d
```

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3002 | React UI |
| **Middleware** | http://localhost:3001 | Node.js API |
| **Backend** | http://localhost:8080/api | Java REST API |

---

## ✅ Verify Setup

```bash
curl http://localhost:8080/api/actuator/health
curl http://localhost:3001/health
curl http://localhost:3002
```

---

## 📋 Prerequisites

- Node.js 20+
- Java 21+
- Maven 3.9+
- PostgreSQL 16+
- Docker (optional)

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
- ✅ Real-time notifications
- ✅ Data analytics

---

**Ready to deploy!**
