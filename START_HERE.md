# 🚀 START HERE - Quick Setup Guide

## Choose Your Path

### 🏃 **Path 1: Fastest (5 minutes) - Docker**

Prerequisites: Docker installed

```bash
docker-compose up -d
```

Access at: http://localhost:3002

---

### 🐢 **Path 2: Simple (10 minutes) - All Services at Once**

Prerequisites: Node.js 20+, Java 21+, Maven 3.9+, PostgreSQL 16+

Linux/Mac:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

Windows:
```bash
start-dev.bat
```

Access at: http://localhost:3002

---

### 🔧 **Path 3: Detailed (15 minutes) - Individual Services**

Open 3 terminals and run in each:

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Middleware:**
```bash
./start-middleware.sh
```

**Terminal 3 - UI:**
```bash
./start-ui.sh
```

Access at: http://localhost:3002

---

## ✅ Verify Everything Works

Once services are running:

```bash
curl http://localhost:3002        # Frontend
curl http://localhost:3001        # Middleware  
curl http://localhost:8080/api    # Backend
```

All should respond with content.

---

## 🐛 Having Issues?

**Choose one:**

1. **Port already in use?**
   ```bash
   lsof -i :3002 && kill -9 <PID>
   ```

2. **Database won't connect?**
   ```bash
   docker run -d --name todo-postgres \
     -e POSTGRES_USER=todo_user \
     -e POSTGRES_PASSWORD=todo_password \
     -e POSTGRES_DB=todo_db \
     -p 5432:5432 \
     postgres:16-alpine
   ```

3. **Dependencies missing?**
   ```bash
   cd deployments/UI && npm install
   cd deployments/Middleware && npm install
   cd deployments/Backend && mvn clean install
   ```

4. **Still stuck?** See `TROUBLESHOOTING.md`

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **QUICKREF.txt** | One-page quick reference |
| **SETUP.md** | Complete setup instructions |
| **DEPLOYMENT.md** | Production deployment |
| **TROUBLESHOOTING.md** | Fix common issues |
| **QUICKSTART.md** | 5-minute quick start |
| **FIXED_ISSUES.md** | What was fixed for you |
| **README.md** | Project overview |

---

## 📁 Your Folders

```
deployments/
├── UI/           ← Frontend (React/Vite)
├── Middleware/   ← API Gateway (Node.js/Express)
└── Backend/      ← Core Service (Java/Spring Boot)
```

Each folder is **self-contained** and ready for deployment.

---

## 🌐 Access Points Once Running

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3002 |
| Middleware | http://localhost:3001 |
| Backend API | http://localhost:8080/api |
| API Docs | http://localhost:8080/api/swagger-ui.html |

---

## 🎯 Next Steps

1. Start services (pick a path above)
2. Open http://localhost:3002
3. Create an account
4. Start building!

---

## 💡 Pro Tips

- Use `start-dev.sh` for fastest local development
- Use Docker for consistent environments
- Use individual scripts for debugging
- Check `TROUBLESHOOTING.md` if stuck
- View logs in `/tmp/` (backend.log, middleware.log, ui.log)

---

**Ready? Pick a path above and get started! 🚀**
