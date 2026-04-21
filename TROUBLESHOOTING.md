# Troubleshooting Guide

## 🎯 Quick Diagnosis

**Run this to see what's happening:**
```bash
# Check what's using ports
lsof -i :3002  # Frontend
lsof -i :3001  # Middleware
lsof -i :8080  # Backend
lsof -i :5432  # Database

# Check if services are running
curl -v http://localhost:3002
curl -v http://localhost:3001
curl -v http://localhost:8080/api
```

---

## ❌ Common Issues & Solutions

### Issue 1: `./start-dev.sh: No Output`

**Cause:** Script exits silently on error

**Solution:**
```bash
# Run individual services instead
./start-backend.sh    # Terminal 1
./start-middleware.sh # Terminal 2
./start-ui.sh        # Terminal 3
```

Check actual error messages in each terminal.

---

### Issue 2: "Port X already in use"

**Frontend (3002):**
```bash
lsof -i :3002
kill -9 <PID>

# Or change port in deployments/UI/.env.local
# VITE_PORT=3003
```

**Middleware (3001):**
```bash
lsof -i :3001
kill -9 <PID>

# Or change in deployments/Middleware/.env
# PORT=3001
```

**Backend (8080):**
```bash
lsof -i :8080
kill -9 <PID>

# Or change in deployments/Backend/application.properties
# server.port=8081
```

**Windows:**
```batch
netstat -ano | findstr :3002
taskkill /PID <PID> /F
```

---

### Issue 3: "Database connection refused"

**Check PostgreSQL is running:**
```bash
# Docker
docker ps | grep postgres
docker logs todo-postgres

# Local PostgreSQL
psql -U todo_user -d todo_db -h localhost
# Password: todo_password
```

**Start PostgreSQL:**
```bash
# Docker (easiest)
docker run -d --name todo-postgres \
  -e POSTGRES_USER=todo_user \
  -e POSTGRES_PASSWORD=todo_password \
  -e POSTGRES_DB=todo_db \
  -p 5432:5432 \
  postgres:16-alpine

# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql

# Windows
# Use PostgreSQL installer
```

**Fix Connection String:**

Check `deployments/Middleware/.env`:
```env
DATABASE_URL=postgresql://todo_user:todo_password@localhost:5432/todo_db
```

Check `deployments/Backend/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/todo_db
spring.datasource.username=todo_user
spring.datasource.password=todo_password
```

---

### Issue 4: "npm install fails"

```bash
# Clear cache
npm cache clean --force

# Remove node_modules
rm -rf deployments/*/node_modules

# Try again
cd deployments/UI && npm install
cd deployments/Middleware && npm install

# Check Node version (should be 20+)
node --version
```

**If still failing:**
```bash
# Use specific Node version
nvm use 20
npm install

# Or upgrade Node
# Visit https://nodejs.org/
```

---

### Issue 5: "Maven build fails"

```bash
# Clear Maven cache
rm -rf ~/.m2/repository
mvn clean

# Try again
cd deployments/Backend
mvn install

# Check Java version (should be 21+)
java -version
```

**If compilation errors:**
```bash
# Skip tests first
mvn clean install -DskipTests

# Then run full build
mvn clean install
```

---

### Issue 6: "npm ERR! ERESOLVE unable to resolve dependency tree"

**Cause:** Dependency conflict in package.json

**Solution:**
```bash
# Use legacy dependency resolution
npm install --legacy-peer-deps

# Or manually fix
npm install --force
```

---

### Issue 7: "Module not found '@tps/shared'"

**Cause:** Shared library path incorrect

**Solution:**

Check `deployments/UI/package.json`:
```json
"@tps/shared": "file:../../packages/shared"
```

Check `deployments/Middleware/package.json`:
```json
"@tps/shared": "file:../../packages/shared"
```

Reinstall:
```bash
cd deployments/UI && npm install
cd deployments/Middleware && npm install
```

---

### Issue 8: "TypeScript compilation error"

**Check tsconfig.json paths:**

UI: `deployments/UI/tsconfig.json`
```json
"paths": {
  "@tps/shared": ["../../packages/shared/src"]
}
```

Middleware: `deployments/Middleware/tsconfig.json`
```json
"paths": {
  "@tps/shared": ["../../packages/shared/src/index.ts"]
}
```

**Fix:**
```bash
npm run build  # Build TypeScript
npm run dev    # Start dev server
```

---

### Issue 9: "Cannot find module 'express'" (Middleware)

**Reinstall dependencies:**
```bash
cd deployments/Middleware
rm -rf node_modules package-lock.json
npm install
npm run build
npm run dev
```

---

### Issue 10: "CORS error" (Frontend can't reach Middleware)

**Check environment variable:**

`deployments/UI/.env.local`:
```env
VITE_API_URL=http://localhost:3001
```

`deployments/Middleware/.env`:
```env
CORS_ORIGIN=http://localhost:3002
```

**Restart both services after changes**

---

### Issue 11: "Flyway migration failed" (Backend)

**Check migration files exist:**
```bash
ls -la deployments/Backend/src/main/resources/db/migration/
```

**Should see:** V0__create_schema.sql, V1__create_users.sql, etc.

**Reset database and retry:**
```bash
# Drop and recreate
psql -U todo_user -d postgres -c "DROP DATABASE todo_db;"
psql -U todo_user -d postgres -c "CREATE DATABASE todo_db;"

# Restart backend - migrations run automatically
cd deployments/Backend
mvn spring-boot:run
```

---

### Issue 12: "Services crash immediately after starting"

**Check logs:**
```bash
tail -f /tmp/backend.log      # Backend
tail -f /tmp/middleware.log   # Middleware
tail -f /tmp/ui.log          # Frontend

# Or check terminal window that started it
```

**Common causes:**
- Database not running
- Port already in use
- Missing environment variables
- Missing dependencies

---

## 🔍 Advanced Debugging

### View All Logs
```bash
# Backend
cd deployments/Backend && tail -100 /tmp/backend.log

# Middleware
cd deployments/Middleware && tail -100 /tmp/middleware.log

# UI
cd deployments/UI && tail -100 /tmp/ui.log
```

### Check Process Status
```bash
# macOS/Linux
ps aux | grep node
ps aux | grep mvn
ps aux | grep vite

# Windows
tasklist | findstr node
tasklist | findstr java
```

### Network Debugging
```bash
# Test connectivity
curl -v http://localhost:3002
curl -v http://localhost:3001
curl -v http://localhost:8080/api

# Check headers
curl -i -H "Accept: application/json" http://localhost:3001
```

### Database Debugging
```bash
# Connect directly
psql -U todo_user -d todo_db

# Check tables
\dt

# Check schema
\dn

# Run query
SELECT * FROM todo_list.users;
```

---

## 🆘 Still Stuck?

1. **Collect info:**
   ```bash
   node --version
   npm --version
   java -version
   mvn --version
   docker --version
   psql --version
   ```

2. **Capture logs:**
   ```bash
   tail -100 /tmp/backend.log > backend-error.log
   tail -100 /tmp/middleware.log > middleware-error.log
   tail -100 /tmp/ui.log > ui-error.log
   ```

3. **Check port conflicts:**
   ```bash
   lsof -i -P -n | grep LISTEN
   ```

4. **Verify database:**
   ```bash
   psql -U todo_user -d todo_db -c "\dt"
   ```

5. **Clean and restart:**
   ```bash
   # Kill all processes
   killall node mvn java
   
   # Remove logs
   rm /tmp/*.log /tmp/*.pid
   
   # Try again
   ./start-dev.sh
   ```

---

## 📞 Need More Help?

Check these files:
- `SETUP.md` - Initial setup
- `DEPLOYMENT.md` - Full deployment guide
- `QUICKSTART.md` - Quick reference

Or run individual services to see actual error messages:
```bash
./start-backend.sh
./start-middleware.sh
./start-ui.sh
```
