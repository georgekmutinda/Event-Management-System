# Docker Setup & Execution Guide

## 📌 SYSTEM REQUIREMENTS VERIFICATION

### ✅ Current Status

- Docker CLI: Installed (Version 29.2.0)
- Docker Compose: Installed (v5.0.2)
- .NET 10.0 Project: ✅ Builds successfully (0 errors)
- Configuration: ✅ Updated for Docker environment variables
- All fixes applied:
  - ✅ RabbitMQ hostname from configuration
  - ✅ Redis connection from configuration
  - ✅ HTTPS redirect disabled for Development
  - ✅ Explicit port binding to 0.0.0.0:8080
  - ✅ Docker-compose version updated to 3.9
  - ✅ RabbitMQ__HostName environment variable added

---

## 🚀 QUICK START (5 Minutes)

### STEP 1: Ensure Docker Desktop is Running

**Windows:**
1. Search for "Docker Desktop" in Windows Start menu
2. Click to launch Docker Desktop
3. Wait 30-60 seconds for it to fully initialize
4. Look for Docker icon in system tray (bottom right)

**Verify Docker is running:**
```powershell
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
(empty or list of running containers)
```

If you see **"cannot connect to Docker daemon"** → Docker Desktop is not running

---

### STEP 2: Navigate to Project Root

```powershell
cd c:\Users\Admin\Desktop\EventManagementSystem
```

---

### STEP 3: Start the Full Stack

```powershell
docker-compose up --build
```

**What this does:**
1. Builds the API Docker image from Dockerfile
2. Starts PostgreSQL container
3. Starts Redis container
4. Starts RabbitMQ container
5. Starts API container
6. Sets up internal networking

**Expected timeline:**
- Docker image build: ~2-3 minutes (first time)
- Container startup: ~30-60 seconds
- Database initialization: ~10-20 seconds
- **Total first run: 3-4 minutes**

---

### STEP 4: Wait for "Now listening on" Message

Watch the console output. When you see:

```
event_mgmt_api | info: Microsoft.Hosting.Lifetime[14]
event_mgmt_api |       Now listening on: http://0.0.0.0:8080
event_mgmt_api | info: Microsoft.Hosting.Lifetime[0]
event_mgmt_api |       Application started
```

✅ **The API is ready!**

---

### STEP 5: Test the Application

**Open Swagger UI in browser:**
```
http://localhost:5100/swagger
```

or

**Test via PowerShell:**
```powershell
# Get OpenAPI spec
Invoke-WebRequest http://localhost:5100/openapi/v1.json | Select-Object -ExpandProperty Content

# Try to get users (should return 401 Unauthorized - requires auth)
Invoke-WebRequest http://localhost:5100/api/users -Headers @{'Content-Type'='application/json'}
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Cannot connect to Docker daemon"

**Cause:** Docker Desktop is not running

**Fix:**
```powershell
# Option 1: Start Docker Desktop (GUI)
# Search "Docker Desktop" in Windows Start menu and click

# Option 2: Verify Docker is running
docker ps

# Option 3: Check Docker Desktop status
# Look for Docker icon in system tray (bottom right of taskbar)
```

---

### Problem: "Port 5100 already in use"

**Cause:** Previous container didn't stop properly

**Fix:**
```powershell
# Option 1: Kill the old process
netstat -ano | findstr :5100
taskkill /PID <PID> /F

# Option 2: Use docker-compose to stop
docker-compose down

# Option 3: Change port in docker-compose.yml
# Change "5100:8080" to "5101:8080" (or any free port)
```

---

### Problem: "Database connection refused"

**Cause:** PostgreSQL container not ready yet

**Fix:**
```powershell
# Wait longer for containers to start
# Docker logs show health check results
docker-compose logs postgres

# If postgres container is unhealthy:
docker-compose down
docker volume rm EventManagementSystem_postgres_data
docker-compose up --build
```

---

### Problem: "Redis connection timeout"

**Cause:** Redis container name wrong or network issue

**Verify:**
```powershell
# Check Redis is running
docker ps | findstr redis

# Check Redis logs
docker-compose logs redis

# Test Redis connection inside container
docker-compose exec redis redis-cli ping
```

---

### Problem: "RabbitMQ connection failed"

**Check configuration:**
```powershell
# Verify RabbitMQ is running
docker ps | findstr rabbitmq

# Check RabbitMQ logs
docker-compose logs rabbitmq

# Access RabbitMQ admin panel
# http://localhost:15672
# Username: guest
# Password: guest
```

---

## 📊 CONTAINER STATUS VERIFICATION

### Check all containers are running:

```powershell
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected output:**
```
NAMES                    STATUS                     PORTS
event_mgmt_api           Up 2 minutes               0.0.0.0:5100->8080/tcp
event_mgmt_rabbitmq      Up 2 minutes               0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
event_mgmt_redis         Up 2 minutes               0.0.0.0:6379->6379/tcp
event_mgmt_postgres      Up 2 minutes               0.0.0.0:5432->5432/tcp
```

All should show **"Up X minutes"**

---

## 📮 SERVICE PORTS & ENDPOINTS

| Service | Container Port | Local Port | Endpoint |
|---------|----------------|-----------|----------|
| **API** | 8080 | 5100 | http://localhost:5100 |
| **Swagger** | 8080 | 5100 | http://localhost:5100/swagger |
| **OpenAPI Spec** | 8080 | 5100 | http://localhost:5100/openapi/v1.json |
| **PostgreSQL** | 5432 | 5432 | localhost:5432 |
| **Redis** | 6379 | 6379 | localhost:6379 |
| **RabbitMQ** | 5672 | 5672 | localhost:5672 |
| **RabbitMQ Management UI** | 15672 | 15672 | http://localhost:15672 |

---

## 🧪 COMPLETE TEST WORKFLOW

### 1. Start the Stack

```powershell
cd c:\Users\Admin\Desktop\EventManagementSystem
docker-compose up --build
# Wait for "Now listening on: http://0.0.0.0:8080"
```

### 2. Register a User

```powershell
$registerBody = @{
    email = "test@example.com"
    password = "Test123!"
    fullName = "Test User"
    roles = @("Attendee")
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5100/api/auth/register" `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $registerBody
```

**Expected response:** HTTP 200 OK

### 3. Login to Get JWT Token

```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5100/api/auth/login" `
    -Method POST `
    -Headers @{'Content-Type'='application/json'} `
    -Body $loginBody

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

**Expected response:** HTTP 200 OK + JWT token

### 4. Access Protected Endpoint with Token

```powershell
Invoke-WebRequest -Uri "http://localhost:5100/api/users" `
    -Method GET `
    -Headers @{
        'Content-Type'='application/json'
        'Authorization'="Bearer $token"
    } | ConvertTo-Json
```

**Expected response:** HTTP 200 OK + user list

### 5. Test Cache (call twice)

```powershell
# First call (database hit)
Invoke-WebRequest -Uri "http://localhost:5100/api/events" `
    -Method GET `
    -Headers @{
        'Content-Type'='application/json'
        'Authorization'="Bearer $token"
    }

# Second call (cache hit - should be faster)
Invoke-WebRequest -Uri "http://localhost:5100/api/events" `
    -Method GET `
    -Headers @{
        'Content-Type'='application/json'
        'Authorization'="Bearer $token"
    }
```

### 6. Access Swagger UI

Open in browser:
```
http://localhost:5100/swagger
```

---

## 🛑 STOPPING THE STACK

**Stop containers (keep volumes):**
```powershell
docker-compose stop
```

**Stop and remove containers (keep volumes):**
```powershell
docker-compose down
```

**Stop, remove containers AND volumes (clean slate):**
```powershell
docker-compose down -v
```

**View logs while running:**
```powershell
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# PostgreSQL only
docker-compose logs -f postgres
```

---

## 📋 ENVIRONMENT VARIABLES CONFIGURED

**In docker-compose.yml:**
```yaml
ASPNETCORE_ENVIRONMENT: Development
ASPNETCORE_URLS: http://+:8080
ConnectionStrings__DefaultConnection: Host=postgres;Database=eventmanagementsystemdb;...
ConnectionStrings__Redis: redis:6379
RabbitMQ__HostName: rabbitmq
JwtSettings__Key: YOUR_SUPER_SECRET_KEY_MUST_BE_AT_LEAST_32_CHARACTERS_LONG!
JwtSettings__Issuer: EventManagementAPI
JwtSettings__Audience: EventManagementUsers
JwtSettings__ExpiryMinutes: 60
```

**All service names (postgres, redis, rabbitmq) are DNS-resolvable within Docker network**

---

## ✅ FINAL CHECKLIST

- [ ] Docker Desktop is running
- [ ] `docker ps` command works
- [ ] Navigated to project root: `c:\Users\Admin\Desktop\EventManagementSystem`
- [ ] Ran: `docker-compose up --build`
- [ ] Saw "Now listening on: http://0.0.0.0:8080"
- [ ] All 4 containers show "Up" status
- [ ] Can access http://localhost:5100/swagger
- [ ] Can register user via `/api/auth/register`
- [ ] Can login and get JWT token via `/api/auth/login`
- [ ] Can access protected endpoint with token
- [ ] PostgreSQL connected (no errors in logs)
- [ ] Redis connected (no errors in logs)
- [ ] RabbitMQ connected (no errors in logs)

---

## 🎯 SUMMARY

**All code fixes applied:**
✅ Program.cs - Environment variables for RabbitMQ, Redis, JWT
✅ docker-compose.yml - All services configured with correct DNS names
✅ Dockerfile - Fixed healthcheck
✅ HTTPS redirect disabled for Development
✅ Explicit port binding to 0.0.0.0:8080
✅ Logging added for startup diagnostics

**Project is ready for Docker deployment!**

Follow the "QUICK START" section above to get running in 5 minutes.

