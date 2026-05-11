# 🚀 EVENT MANAGEMENT SYSTEM - STARTUP GUIDE

**Version:** 1.0  
**Last Updated:** May 11, 2026  
**Status:** ✅ Ready for Deployment

---

## 📋 PREREQUISITES

Before starting the system, ensure you have:

- ✅ **Docker Desktop** installed and running
- ✅ **Docker Compose** (comes with Docker Desktop)
- ✅ **Git** (for version control)
- ✅ **Web Browser** (Chrome, Firefox, Edge, Safari)
- ✅ **~5GB disk space** (for Docker images and database)

### System Requirements
- **OS:** Windows, macOS, or Linux
- **RAM:** Minimum 4GB (8GB recommended)
- **CPU:** Minimum 2 cores (4 cores recommended)

---

## 🎯 STARTUP PROCEDURE

### Step 1: Navigate to Project Directory
```bash
cd c:/Users/Admin/Desktop/EventManagementSystem
```

### Step 2: Verify Docker is Running
```bash
docker --version
docker-compose --version
```

**Expected Output:**
```
Docker version 24.x.x
Docker Compose version 2.x.x
```

### Step 3: Clean Up Previous Containers (Optional)
```bash
docker-compose down -v
```

This removes all containers and volumes, giving a fresh start.

### Step 4: Build and Start Services
```bash
docker-compose up -d postgres redis rabbitmq api frontend
```

**Watch for these messages:**
```
Network event_network Creating
Network event_network Created
Container event_mgmt_postgres Creating
Container event_mgmt_redis Creating
Container event_mgmt_rabbitmq Creating
Container event_mgmt_api Creating
Container event_mgmt_frontend Creating
```

### Step 5: Verify Services are Running
```bash
docker-compose ps
```

**Expected Output:**
```
NAME                  STATUS                    PORTS
event_mgmt_postgres   Up X minutes (healthy)    0.0.0.0:5432->5432/tcp
event_mgmt_redis      Up X minutes (healthy)    0.0.0.0:6379->6379/tcp
event_mgmt_rabbitmq   Up X minutes (healthy)    0.0.0.0:5672->5672/tcp
event_mgmt_api        Up X minutes (healthy)    0.0.0.0:5100->5100/tcp
event_mgmt_frontend   Up X minutes              0.0.0.0:5500->80/tcp
```

**All should show "healthy" or "Up"**

### Step 6: Wait for API to be Ready
The API performs database migrations and seeding on startup. This takes ~30-60 seconds.

```bash
# Watch the API logs
docker-compose logs -f api
```

**Wait for this message:**
```
[STARTUP] API is live and Swagger is at /swagger
Now listening on: http://0.0.0.0:5100
Application started. Press Ctrl+C to shut down.
```

---

## 🌐 ACCESSING THE SYSTEM

### Frontend Application
**URL:** http://localhost:5500

**What to see:**
- "Eventara — Luxury Event Management Platform" header
- Login form with email and password fields
- Register tab for new accounts

### Backend API
**URL:** http://localhost:5100/api

**Base endpoint for all API calls**

### API Documentation (Swagger UI)
**URL:** http://localhost:5100/swagger

**Interactive API documentation:**
- Browse all endpoints
- Test endpoints directly
- Authorize with Bearer token
- See request/response schemas

### RabbitMQ Management Console
**URL:** http://localhost:15672

**Credentials:** guest / guest

**What to see:**
- RabbitMQ dashboard
- Queue management
- Message statistics

---

## 🔑 FIRST LOGIN

### Using Pre-seeded Admin Account

1. Navigate to: http://localhost:5500
2. Enter credentials:
   - **Email:** admin@eventara.com
   - **Password:** SecurePassword123!
3. Click "Sign In to Platform"
4. You should see the Admin Dashboard

### Other Pre-seeded Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@eventara.com | SecurePassword123! |
| Planner | alice.planner@example.com | SecurePassword123! |
| Vendor | bob.vendor@example.com | SecurePassword123! |
| Vendor | emma.vendor@example.com | SecurePassword123! |
| Attendee | carol.attendee@example.com | SecurePassword123! |
| Service Provider | david.provider@example.com | SecurePassword123! |

---

## 🧪 VERIFY API IS WORKING

### Using curl (Command Line)

**1. Login and Get Token:**
```bash
curl -X POST http://localhost:5100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eventara.com","password":"SecurePassword123!"}'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 6,
    "email": "admin@eventara.com",
    "fullName": "Admin User"
  }
}
```

**2. Get Events (using token):**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5100/api/events \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** Array of events (3 seeded events)

**3. Test Authorization (should fail without token):**
```bash
curl -X GET http://localhost:5100/api/events
```

**Expected Response:** 401 Unauthorized

---

## 📊 MONITORING SERVICES

### View Service Status
```bash
docker-compose ps
```

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq
```

### Check Database Connection
```bash
docker-compose exec postgres psql -U postgres -d eventmanagementsystemdb -c "SELECT COUNT(*) FROM \"User\";"
```

### Check Redis Connection
```bash
docker-compose exec redis redis-cli ping
```

**Expected:** `PONG`

### Check RabbitMQ Connection
```bash
docker-compose exec rabbitmq rabbitmq-diagnostics ping
```

---

## 🛑 STOPPING THE SYSTEM

### Stop All Services (Keep Data)
```bash
docker-compose stop
```

### Stop and Remove Containers (Keep Data)
```bash
docker-compose down
```

### Stop and Remove Everything (Delete Data)
```bash
docker-compose down -v
```

⚠️ **WARNING:** The `-v` flag deletes all database data. Use only if you want a fresh start!

---

## 🔄 RESTARTING SERVICES

### Quick Restart
```bash
docker-compose restart
```

### Full Restart (Clean)
```bash
docker-compose down && docker-compose up -d
```

### Restart Specific Service
```bash
docker-compose restart api
docker-compose restart postgres
```

---

## 🐛 TROUBLESHOOTING

### Issue: Containers Not Starting

**Symptoms:** `docker-compose ps` shows containers in "Restarting" state

**Solution:**
```bash
# Check logs
docker-compose logs api

# Restart all services
docker-compose down
docker-compose up -d

# Wait 30-60 seconds for services to become healthy
docker-compose ps
```

### Issue: Can't Connect to Frontend

**Symptoms:** http://localhost:5500 shows connection error

**Solution:**
```bash
# Check if frontend container is running
docker-compose ps frontend

# Check if port 5500 is available
netstat -an | findstr 5500

# If port is in use, try different port or kill the process
docker-compose down
docker-compose up -d
```

### Issue: Login Fails

**Symptoms:** "Invalid credentials" error

**Solution:**
1. Verify you're using correct credentials:
   - Email: admin@eventara.com
   - Password: SecurePassword123!
2. Check backend logs for errors:
   ```bash
   docker-compose logs api | grep -i "invalid\|credential"
   ```
3. Verify database is seeded:
   ```bash
   docker-compose exec postgres psql -U postgres -d eventmanagementsystemdb -c "SELECT * FROM \"User\" LIMIT 1;"
   ```

### Issue: API Returns 401 Unauthorized

**Symptoms:** API endpoints return HTTP 401

**Solution:**
- This is expected! The API requires JWT authorization
- Get a token by logging in first
- Include `Authorization: Bearer {token}` header in requests
- Tokens expire after 60 minutes

### Issue: Database Connection Failed

**Symptoms:** API logs show "Cannot connect to database"

**Solution:**
```bash
# Check if postgres is healthy
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify connection string
docker-compose exec postgres pg_isready -U postgres

# If unhealthy, restart postgres
docker-compose restart postgres
```

### Issue: Redis Connection Failed

**Symptoms:** API logs show "Cannot connect to Redis"

**Solution:**
```bash
# Check if redis is running
docker-compose ps redis

# Test redis connection
docker-compose exec redis redis-cli ping

# If not responding, restart
docker-compose restart redis
```

### Issue: Slow Startup

**Symptoms:** API takes more than 2 minutes to start

**Solution:**
- This is normal on first startup (images being pulled)
- Monitor progress: `docker-compose logs -f api`
- Ensure you have:
  - Stable internet connection
  - At least 5GB free disk space
  - 4GB+ available RAM

---

## 📱 ACCESSING FROM DIFFERENT MACHINES

### From Another Computer on Same Network

**Backend:** http://{YOUR_MACHINE_IP}:5100  
**Frontend:** http://{YOUR_MACHINE_IP}:5500

**To find your IP:**

Windows:
```bash
ipconfig
```

macOS/Linux:
```bash
ifconfig
```

**Note:** This only works if:
- Docker is running on the machine
- Network firewall allows traffic on ports 5100 and 5500

---

## 🔐 SECURITY NOTES

### Production Deployment

⚠️ **BEFORE DEPLOYING TO PRODUCTION:**

1. **Change Default Passwords**
   - Database: Change `gkyalo` password
   - RabbitMQ: Change `guest` credentials

2. **Update JWT Key**
   - Generate new 64+ character key
   - Update `JwtSettings__Key` in docker-compose.yml

3. **Use HTTPS**
   - Configure SSL/TLS certificates
   - Update `ASPNETCORE_URLS` to use HTTPS

4. **Configure CORS**
   - Update frontend allowed origins in Program.cs
   - Remove `AllowAnyOrigin()` in production

5. **Database Backups**
   - Set up PostgreSQL backup strategy
   - Mount volumes to persistent storage

6. **Logging & Monitoring**
   - Set up centralized logging
   - Configure health checks
   - Set up alerts

7. **Rate Limiting**
   - Implement rate limiting for API endpoints
   - Protect against brute force attacks

---

## 📞 SUPPORT & RESOURCES

### API Documentation
- **Swagger UI:** http://localhost:5100/swagger
- **Endpoints Reference:** See SYSTEM_STATUS.md

### Configuration Files
- **Backend:** EventManagementApi/appsettings.json
- **Docker:** docker-compose.yml
- **Frontend:** www/js/config.js

### Database
- **Connection String:** Host=localhost;Database=eventmanagementsystemdb;Username=postgres;Password=gkyalo
- **Migrations:** EventManagementApi/Migrations/

### Logs & Debugging
- **API Logs:** `docker-compose logs api`
- **Database Logs:** `docker-compose logs postgres`
- **All Logs:** `docker-compose logs`

---

## ✅ STARTUP CHECKLIST

Before declaring the system ready, verify:

- [ ] All 5 containers are running and healthy
- [ ] Frontend loads at http://localhost:5500
- [ ] Swagger UI is available at http://localhost:5100/swagger
- [ ] Can login with admin@eventara.com
- [ ] API responds to authenticated requests
- [ ] Database queries execute successfully
- [ ] Redis is responding to PING
- [ ] RabbitMQ is accessible
- [ ] No error logs in `docker-compose logs`

---

## 🎓 NEXT STEPS

After successful startup:

1. **Explore the Frontend**
   - Login with different roles
   - Test creating events
   - Test user registrations

2. **Test the API**
   - Use Swagger UI
   - Try different endpoints
   - Test authorization

3. **Review Documentation**
   - Read SYSTEM_STATUS.md for full architecture
   - Review API endpoints
   - Understand authentication flow

4. **Set Up Development**
   - Review Clean Architecture layers
   - Understand repository pattern
   - Review AutoMapper configuration

---

**Generated:** May 11, 2026  
**Ready for:** Immediate Use ✅
