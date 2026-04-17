# Project Scan Report - April 16, 2026

## FINDINGS

### ✅ Current State

**Positive:**
- ✅ Dockerfile exists with multi-stage build
- ✅ docker-compose.yml exists with 4 services
- ✅ appsettings.json has connection strings
- ✅ Program.cs has JWT, Redis, RabbitMQ setup
- ✅ Environment variables in docker-compose.yml

### ❌ CRITICAL ISSUES FOUND

**1. RabbitMqService Registration**
   - **Problem:** RabbitMqService registered without hostname parameter
   - **Line:** Program.cs:50 `builder.Services.AddScoped<IRabbitMqService, RabbitMqService>();`
   - **Issue:** Defaults to "localhost" hardcoded in constructor
   - **Impact:** Won't work in Docker with service name "rabbitmq"

**2. RabbitMqService Constructor**
   - **Problem:** Has hardcoded default "localhost"
   - **Code:** `RabbitMqService(string hostName = "localhost")`
   - **Impact:** Ignores environment variables

**3. Docker Healthcheck**
   - **Problem:** Dockerfile healthcheck uses `curl` which may not be in image
   - **Line:** `CMD curl -f http://localhost:8080/openapi/v1.json || exit 1`
   - **Issue:** localhost won't resolve in container, curl may not exist
   - **Fix:** Use `dotnet` or `wget` instead

**4. Redis Connection in Docker**
   - **Problem:** docker-compose.yml sets `ConnectionStrings__Redis: redis:6379`
   - **Issue:** But Program.cs reads from `ConnectionStrings:Redis` (colon vs double-underscore inconsistency)
   - **Status:** May work due to configuration provider normalization, but risky

**5. HTTPS Redirection**
   - **Problem:** `app.UseHttpsRedirection();` in Program.cs
   - **Issue:** Breaks Docker local development
   - **Fix:** Disable for Development environment

**6. Port Binding**
   - **Current:** Dockerfile EXPOSE 8080, docker-compose maps 5100:8080
   - **Issue:** Program.cs doesn't explicitly bind to 0.0.0.0:8080
   - **Fix:** Add `app.Urls.Add("http://0.0.0.0:8080");` or use ASPNETCORE_URLS env var

### 📋 CONFIGURATION COMPARISON

**appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;...",
    "Redis": "localhost:6379"
  },
  "RabbitMQ": {
    "HostName": "localhost"
  }
}
```

**docker-compose.yml environment:**
```yaml
ConnectionStrings__DefaultConnection: Host=postgres;...
ConnectionStrings__Redis: redis:6379
JwtSettings__Key: ...
```

**Missing in docker-compose:**
- `RabbitMQ__HostName: rabbitmq` (not set!)

### 🚨 ROOT CAUSE OF "LOCALHOST UNREACHABLE"

1. **API Container** can't reach localhost because localhost inside Docker = the container itself
2. **Services are different containers:**
   - postgres container (dns: `postgres`)
   - redis container (dns: `redis`)
   - rabbitmq container (dns: `rabbitmq`)
3. **Current config uses localhost** which fails in Docker
4. **HTTPS redirect** may break connectivity

---

## REQUIRED FIXES

### Fix 1: Update Program.cs
- [ ] Read RabbitMQ hostname from configuration
- [ ] Register RabbitMqService with config hostname
- [ ] Disable HTTPS redirect for Development
- [ ] Add explicit port binding to 0.0.0.0:8080
- [ ] Log all connection strings at startup

### Fix 2: Update RabbitMqService.cs
- [ ] Accept IConfiguration in constructor
- [ ] Remove hardcoded "localhost" default
- [ ] Use configuration value

### Fix 3: Update Dockerfile
- [ ] Fix healthcheck (use different method)
- [ ] Ensure ASPNETCORE_URLS is respected

### Fix 4: Update docker-compose.yml
- [ ] Add RabbitMQ__HostName environment variable
- [ ] Verify all environment variables are set

### Fix 5: Create .env file (optional)
- [ ] For easier local testing without docker

---

## VERIFICATION STEPS

After fixes:
1. [ ] `docker-compose up --build`
2. [ ] Verify all 4 containers running
3. [ ] Check logs: "Now listening on http://0.0.0.0:8080"
4. [ ] Test: `curl http://localhost:5100/openapi/v1.json`
5. [ ] Test: `curl http://localhost:5100/api/users` → 401 (needs auth)
6. [ ] Verify Redis connection in logs
7. [ ] Verify RabbitMQ connection in logs
8. [ ] Access Swagger at `http://localhost:5100/swagger`

