# Local Development Setup

## 🚀 Quick Start (Recommended for First Time)

### Option A: Automated Setup (All-in-One)
```bash
chmod +x start-dev.sh
./start-dev.sh
```

This script will:
- ✓ Check all requirements (Node, Java, Maven)
- ✓ Start PostgreSQL in Docker (if available)
- ✓ Install dependencies
- ✓ Build all services
- ✓ Start all 3 services with visible logs

**Access:**
- Frontend: http://localhost:3002
- Middleware: http://localhost:3001  
- Backend: http://localhost:8080/api

---

### Option B: Individual Services (Debugging)

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

---

## 📋 Prerequisites

### Required
- **Node.js 20+** - [Download](https://nodejs.org/)
- **Java 21+** - [Download](https://www.oracle.com/java/technologies/downloads/)
- **Maven 3.9+** - [Download](https://maven.apache.org/)

### Optional but Recommended
- **Docker** - [Download](https://www.docker.com/)
- **PostgreSQL 16** - [Download](https://www.postgresql.org/)

**Check installation:**
```bash
node --version      # v20.x.x
npm --version       # 10.x.x
java -version       # 21.x.x
mvn --version       # 3.9.x
```

---

## 🗄️ Database Setup

### Option 1: Docker (Easiest)
```bash
docker run -d \
  --name todo-postgres \
  -e POSTGRES_USER=todo_user \
  -e POSTGRES_PASSWORD=todo_password \
  -e POSTGRES_DB=todo_db \
  -p 5432:5432 \
  postgres:16-alpine
```

### Option 2: Manual PostgreSQL
```bash
# Create user
createuser -P todo_user  # Password: todo_password

# Create database
createdb -O todo_user todo_db

# Verify connection
psql -U todo_user -d todo_db -h localhost
```

---

## 🏃 Running Services

### Start All at Once
```bash
./start-dev.sh
```

### Start Individually

**1. Backend (Terminal 1)**
```bash
cd deployments/Backend
mvn spring-boot:run
```

**2. Middleware (Terminal 2)**
```bash
cd deployments/Middleware
npm install    # First time only
npm run build  # First time only
npm run dev
```

**3. UI (Terminal 3)**
```bash
cd deployments/UI
npm install    # First time only
npm run dev
```

---

## ✅ Verify Everything Works

### Check All Services
```bash
# Backend health
curl http://localhost:8080/api/actuator/health

# Middleware health
curl http://localhost:3001/health

# Frontend (should show HTML)
curl http://localhost:3002 | head -5
```

**Expected output:** `{"status":"UP"}` or `active`

### Open in Browser
- Frontend: http://localhost:3002
- Swagger API Docs: http://localhost:8080/api/swagger-ui.html

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
lsof -i :3002  # Frontend
lsof -i :3001  # Middleware
lsof -i :8080  # Backend

# Kill the process (macOS/Linux)
kill -9 <PID>

# Windows
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

### "Database connection error"
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Or check local PostgreSQL
pg_isready -h localhost

# Verify credentials
psql -U todo_user -d todo_db -h localhost
# Password: todo_password
```

### "npm install fails"
```bash
# Clear cache
npm cache clean --force

# Try again
npm install

# If still fails, check Node version
node --version  # Should be 20+
```

### "Maven build fails"
```bash
# Clear Maven cache
mvn clean

# Try again
mvn install

# Check Java version
java -version  # Should be 21+
```

### "Module not found" errors
```bash
# Middleware
cd deployments/Middleware
npm install
npm run build

# UI
cd deployments/UI
npm install
```

### Services crash after starting
Check logs:
```bash
tail -f /tmp/backend.log      # Backend
tail -f /tmp/middleware.log   # Middleware
tail -f /tmp/ui.log          # UI
```

---

## 📊 Expected Output

### Frontend Start
```
VITE v6.2.0  ready in 234 ms

➜  Local:   http://localhost:3002/
➜  press h to show help
```

### Middleware Start
```
[nodemon] restarting due to changes...
[nodemon] starting `node dist/index.js`
listening on port 3001
```

### Backend Start
```
2026-04-21 ... o.s.b.w.embedded.tomcat.TomcatWebServer  : 
Tomcat started on port(s): 8080 (http)
Started BackendApplication in 12.345 seconds
```

---

## 🔧 Development Workflow

### Make Code Changes
1. Edit files in `deployments/[UI|Middleware|Backend]/`
2. Frontend & Middleware hot-reload automatically
3. Backend requires restart (Ctrl+C, then rerun)

### Database Changes
1. Add migration file: `deployments/Backend/src/main/resources/db/migration/`
2. Restart backend
3. Flyway runs migrations automatically

### Configuration
- Frontend: `deployments/UI/.env.local`
- Middleware: `deployments/Middleware/.env`
- Backend: `deployments/Backend/application.properties`

---

## 🐳 Docker Setup

Instead of local installation:
```bash
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all
docker-compose down
```

---

## 📞 Need Help?

1. Check logs: `tail -f /tmp/[service].log`
2. Verify ports: `lsof -i :[port]`
3. Check database: `psql -U todo_user -d todo_db`
4. Restart a service: Kill process and rerun script

---

## 📝 Next Steps

After successful startup:
1. Create a user account at http://localhost:3002
2. Test creating a todo item
3. Check database: `psql -U todo_user -d todo_db -c "SELECT * FROM todo_list.users;"`
