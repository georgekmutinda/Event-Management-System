# QUICK REFERENCE - Docker & API Launch

## 🚀 30-SECOND STARTUP

```powershell
# 1. Navigate to project
cd c:\Users\Admin\Desktop\EventManagementSystem

# 2. Start Docker stack
docker-compose up --build

# 3. Wait for this message:
# event_mgmt_api | Now listening on: http://0.0.0.0:8080
# event_mgmt_api | Application started

# 4. Open in browser
# http://localhost:5100/swagger
```

---

## 📋 WHAT TO EXPECT

| Service | Status | Port | Check |
|---------|--------|------|-------|
| **PostgreSQL** | Healthy | 5432 | Connects to eventmanagementsystemdb |
| **Redis** | Healthy | 6379 | Ready to accept connections |
| **RabbitMQ** | Healthy | 5672 | Message broker ready |
| **API** | Running | 5100 | Now listening on: http://0.0.0.0:8080 |

---

## ✅ STARTUP LOGS TO LOOK FOR

```
[STARTUP] DB CONNECTION: Host=localhost;Database=eventmanagementsystemdb;...
[STARTUP] RabbitMQ Host from config: rabbitmq
[STARTUP] Redis Connection from config: redis:6379
[STARTUP] OpenAPI mapped
[STARTUP] Binding to http://0.0.0.0:8080
Now listening on: http://0.0.0.0:8080
Application started. Press Ctrl+C to shut down.
```

**All present?** → ✅ **System running correctly**

---

## 🧪 INSTANT TESTS

### Test API is Running
```powershell
curl http://localhost:5100/openapi/v1.json
# or
Invoke-WebRequest http://localhost:5100/openapi/v1.json
```

### Test Swagger UI
```
http://localhost:5100/swagger
```

### Test Authentication
```powershell
# Register
curl -X POST http://localhost:5100/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@test.com",
    "password":"Test123!",
    "fullName":"Test",
    "roles":["Attendee"]
  }'

# Login  
curl -X POST http://localhost:5100/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@test.com",
    "password":"Test123!"
  }'
```

---

## 🛑 TROUBLESHOOTING

### Port 5100 already in use
```powershell
netstat -ano | findstr :5100
taskkill /PID <PID> /F
```

### Docker daemon not running
```powershell
# Start Docker Desktop (GUI)
# Or check: docker ps
# Should show running containers
```

### PostgreSQL won't connect
```powershell
docker-compose logs postgres
docker-compose down -v  # Remove volumes
docker-compose up --build  # Start fresh
```

### View live logs
```powershell
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

---

## 🔄 RESTART / CLEANUP

### Stop everything (keep data)
```powershell
docker-compose stop
```

### Stop and remove (keep data)
```powershell
docker-compose down
```

### Full clean slate
```powershell
docker-compose down -v
docker-compose up --build
```

---

## 📊 CONTAINER STATUS

```powershell
# List all containers
docker ps --format "table {{.Names}}\t{{.Status}}"

# Expected output:
# NAMES                STATUS
# event_mgmt_api       Up 2 minutes
# event_mgmt_postgres  Up 2 minutes
# event_mgmt_redis     Up 2 minutes
# event_mgmt_rabbitmq  Up 2 minutes
```

---

## 🎯 ENDPOINTS

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/openapi/v1.json` | GET | OpenAPI spec | ❌ |
| `/swagger` | GET | Swagger UI | ❌ |
| `/api/auth/register` | POST | Register user | ❌ |
| `/api/auth/login` | POST | Login & get token | ❌ |
| `/api/users` | GET | Get all users | ✅ |
| `/api/events` | GET | Get all events | ✅ |

---

## 💡 TIPS

- **First run takes 3-4 minutes** (Docker build + migrations)
- **Logs show everything** - watch for `[STARTUP]` messages
- **All services must be healthy** - PostgreSQL, Redis, RabbitMQ, API
- **Environment variables override** appsettings.json
- **Service names** (postgres, redis, rabbitmq) work only inside Docker network

---

## ✨ SUCCESS INDICATORS

✅ Docker ps shows 4 running containers  
✅ API logs show "[STARTUP]" messages  
✅ http://localhost:5100/swagger loads  
✅ Can register user via `/api/auth/register`  
✅ Can login and get JWT token  
✅ Can access `/api/users` with token  
✅ Gets 401 without token  

**All above = System working perfectly!**

---

## 📞 NEED HELP?

**Problem:** Can't connect to API  
**Solution:** Wait 30+ seconds, check logs, verify Docker running

**Problem:** Port in use  
**Solution:** Kill process using port or change port in docker-compose.yml

**Problem:** Database won't start  
**Solution:** Remove volumes with `docker-compose down -v`, rebuild

**Problem:** RabbitMQ/Redis errors  
**Solution:** Check [STARTUP] logs, verify environment variables set

---

**Everything ready! Just run: `docker-compose up --build`**

