# Todo Productivity Suite - Deployment Guide

## 📁 Structure

```
deployments/
├── UI/              # React/Vite Frontend (port 3002)
├── Middleware/      # Node.js Express Backend (port 3001)
└── Backend/         # Java Spring Boot Backend (port 8080)
```

## 🚀 Quick Start

### Option 1: Local Development (All Services)

```bash
# Make script executable
chmod +x start.sh

# Run all services
./start.sh
```

Services will start on:
- **Frontend**: http://localhost:3002
- **Middleware**: http://localhost:3001
- **Backend**: http://localhost:8080

### Option 2: Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Option 3: Individual Services

#### Backend (Java Spring Boot)
```bash
cd deployments/Backend
mvn clean install
mvn spring-boot:run
```

#### Middleware (Node.js)
```bash
cd deployments/Middleware
npm install
npm run dev
```

#### UI (React/Vite)
```bash
cd deployments/UI
npm install
npm run dev
```

---

## 🔧 Configuration

### Environment Variables

#### Middleware (`.env`)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `BACKEND_URL` - Backend service URL
- `JWT_SECRET` - JWT signing key

#### Backend (`application.properties`)
- `spring.datasource.url` - PostgreSQL connection
- `spring.datasource.username` - Database user
- `spring.datasource.password` - Database password
- `spring.jpa.properties.hibernate.default_schema` - Schema name (todo_list)

#### UI (`.env.local`)
- `VITE_API_URL` - Middleware API URL
- `VITE_APP_NAME` - Application name

---

## 🗄️ Database Setup

### PostgreSQL Schema
All tables are created in the `todo_list` schema via Flyway migrations.

**Migrations Location**: `deployments/Backend/src/main/resources/db/migration/`

**Tables**:
- users
- refresh_tokens
- tasks
- subtasks
- task_comments
- focus_sessions
- goals
- career
- health
- roster
- notifications
- ai_conversations

### Initial Setup
```bash
# Backend runs migrations automatically on startup
cd deployments/Backend
mvn spring-boot:run
```

---

## 📊 Service Health Checks

**Backend**: `http://localhost:8080/api/actuator/health`
**Middleware**: `http://localhost:3001/health`
**Frontend**: `http://localhost:3002`

---

## 🚢 Production Deployment

### Prerequisites
- Java 21+
- Node.js 20+
- Maven 3.9+
- PostgreSQL 16+
- Docker & Docker Compose (for containerized deployment)

### Steps

1. **Set Production Env Variables**
   - Update `.env` files with production values
   - Use strong JWT secrets and database credentials

2. **Build**
   ```bash
   # Backend
   cd deployments/Backend
   mvn clean package -DskipTests

   # Middleware
   cd deployments/Middleware
   npm install && npm run build

   # UI
   cd deployments/UI
   npm install && npm run build
   ```

3. **Deploy**
   - Backend: Deploy JAR to application server
   - Middleware: Deploy Node.js app to server/container
   - UI: Deploy `dist/` folder to CDN/static host

4. **Database Migrations**
   - Flyway runs automatically on backend startup
   - Ensure database user has schema creation privileges

---

## 🐛 Troubleshooting

**Port Already in Use**
```bash
# Find process using port
lsof -i :3002  # Frontend
lsof -i :3001  # Middleware
lsof -i :8080  # Backend

# Kill process
kill -9 <PID>
```

**Database Connection Error**
- Verify PostgreSQL is running
- Check connection string in `.env` / `application.properties`
- Ensure database exists: `todo_db`
- Check schema: `todo_list`

**Missing Dependencies**
```bash
# Middleware
cd deployments/Middleware
npm install

# UI
cd deployments/UI
npm install

# Backend
cd deployments/Backend
mvn install
```

---

## 📝 Verification Checklist

- [ ] All 3 services start without errors
- [ ] Database migrations complete successfully
- [ ] UI loads at http://localhost:3002
- [ ] Middleware responds at http://localhost:3001
- [ ] Backend API at http://localhost:8080/api
- [ ] Health check endpoints return 200 status
- [ ] Frontend can communicate with middleware
- [ ] Middleware can communicate with backend
- [ ] Database contains `todo_list` schema with all tables

---

## 📞 Support

For issues, check:
1. Service logs (console output or Docker logs)
2. Environment variables configuration
3. Database connectivity
4. Port availability
5. Firewall/network settings
