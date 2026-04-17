# Event Management API

A modern, scalable event management system built with **ASP.NET Core** using **Clean Architecture** principles.

## 🎯 Overview

The Event Management API provides a comprehensive solution for managing events, registrations, vendors, and services. It's designed with enterprise-grade security, caching, and asynchronous messaging patterns.

## 🏗️ Architecture

Built following **Clean Architecture** principles with clear separation of concerns:

```
EventManagementApi/
├── API/                      # Controllers & API endpoints
├── Application/              # Business logic, DTOs, Mappings, Services
├── Domain/                   # Core entities and business rules
├── Infrastructure/           # Data access, repositories
└── Properties/               # Project configuration
```

## 🛠️ Tech Stack

- **Framework:** ASP.NET Core 8.0
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **Message Queue:** RabbitMQ 3.13
- **Authentication:** JWT (JSON Web Tokens)
- **ORM:** Entity Framework Core
- **Mapping:** AutoMapper
- **API Documentation:** Swagger/OpenAPI
- **Testing:** xUnit, Moq

## 📋 Features

✅ User Management & Authentication
✅ Event Management (Create, Read, Update, Delete)
✅ Event Registration & Capacity Management
✅ Vendor Management
✅ Service Provider Integration
✅ Payment Processing
✅ Role-Based Access Control (RBAC)
✅ JWT-based API Security
✅ Caching with Redis
✅ Async Message Publishing (RabbitMQ)
✅ Comprehensive API Documentation (Swagger)
✅ Database seeding with initial data

## 🔐 Security Features

- **JWT Authentication** with configurable expiry
- **Password Hashing** with BCrypt
- **Authorization Policies** for role-based access
- **Global Authorization** enforcing authentication by default
- **Swagger UI** with Bearer token support
- **Environment-specific Configuration** (Development, Production)

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 SDK or later
- Docker & Docker Compose (recommended)
- PostgreSQL 16 (if running without Docker)
- Redis 7 (if running without Docker)
- RabbitMQ 3.13 (if running without Docker)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/EventManagementApi.git
cd EventManagementApi

# Start services with Docker Compose
docker-compose up -d

# API will be available at: http://localhost:5100
# Swagger documentation: http://localhost:5100/swagger
```

### Local Development Setup

1. **Install dependencies:**
   ```bash
   cd EventManagementApi
   dotnet restore
   ```

2. **Configure appsettings.json:**
   - Update connection strings for PostgreSQL, Redis, RabbitMQ

3. **Run migrations:**
   ```bash
   dotnet ef database update
   ```

4. **Start the API:**
   ```bash
   dotnet run
   ```

5. **Access Swagger UI:**
   Navigate to: `http://localhost:5000/swagger`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT)

### Events
- `GET /api/events` - List all events
- `GET /api/events/{id}` - Get event details
- `POST /api/events` - Create new event `[Authorize]`
- `PUT /api/events/{id}` - Update event `[Authorize]`
- `DELETE /api/events/{id}` - Delete event `[Authorize]`

### Users
- `GET /api/users` - List users `[Authorize]`
- `GET /api/users/{id}` - Get user details `[Authorize]`
- `PUT /api/users/{id}` - Update user `[Authorize]`
- `DELETE /api/users/{id}` - Delete user `[Authorize]`

### Event Registrations
- `POST /api/registrations` - Register user for event `[Authorize]`
- `GET /api/registrations` - List registrations `[Authorize]`
- `DELETE /api/registrations/{id}` - Cancel registration `[Authorize]`

*See `/swagger` for complete API documentation*

## 🔑 Authentication

The API uses **JWT Bearer tokens** for authentication.

### Getting a Token

1. Register or login:
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. Response includes JWT token:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "message": "Login successful"
   }
   ```

3. Use token in Swagger or HTTP requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🗄️ Database

### Connection String
```
Host=localhost;Database=eventmanagementsystemdb;Username=postgres;Password=gkyalo
```

### Migrations
```bash
# Create new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Revert to previous migration
dotnet ef database update PreviousMigrationName
```

### Seeding
Automatic seeding on application startup:
- Default roles (Admin, User, Vendor, ServiceProvider)
- Sample users and events

## 📦 Docker Deployment

### Environment Variables
Set in `docker-compose.yml`:

```yaml
environment:
  ASPNETCORE_ENVIRONMENT: Development
  ASPNETCORE_URLS: http://+:8080
  ConnectionStrings__DefaultConnection: Host=postgres;Database=eventmanagementsystemdb;Username=postgres;Password=gkyalo
  JwtSettings__Key: your-secure-key-here
  JwtSettings__Issuer: EventManagementAPI
  JwtSettings__Audience: EventManagementUsers
```

### Build & Push Docker Image

```bash
# Build image
docker build -t eventmanagement-api:v1 -f EventManagementApi/Dockerfile .

# Tag for registry
docker tag eventmanagement-api:v1 your-registry/eventmanagement-api:v1

# Push to registry
docker push your-registry/eventmanagement-api:v1
```

## 🧪 Testing

### Run Unit Tests
```bash
dotnet test EventManagementApi.Tests
```

### Run Integration Tests
```bash
dotnet test EventManagementApi.Tests --filter "Category=Integration"
```

### Test Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

## 📝 Project Structure

```
EventManagementSystem/
├── EventManagementApi/                 # Main API Project
│   ├── API/Controllers/                # API Controllers
│   ├── Application/                    # Business Logic
│   │   ├── DTOs/                       # Data Transfer Objects
│   │   ├── Interfaces/                 # Service Contracts
│   │   └── Services/                   # Service Implementations
│   ├── Domain/                         # Domain Entities
│   │   ├── Data/                       # DbContext
│   │   └── Entities/                   # Core Entities
│   ├── Infrastructure/                 # Data Access
│   │   ├── Repositories/               # Repository Pattern
│   │   └── SeedData/                   # Database Seeders
│   ├── Migrations/                     # EF Core Migrations
│   ├── Program.cs                      # Application Entry Point
│   ├── appsettings.json               # Configuration
│   └── Dockerfile                      # Docker Configuration
│
├── EventManagementApi.Tests/           # Test Project
│   ├── Unit/                           # Unit Tests
│   ├── Integration/                    # Integration Tests
│   └── Fixtures/                       # Test Fixtures
│
└── docker-compose.yml                  # Docker Compose Setup
```

## 🔧 Configuration

### appsettings.json
```json
{
  "JwtSettings": {
    "Key": "your-secret-key-at-least-64-characters",
    "Issuer": "EventManagementAPI",
    "Audience": "EventManagementUsers",
    "ExpiryMinutes": 60
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=eventmanagementsystemdb;Username=postgres;Password=gkyalo",
    "Redis": "localhost:6379"
  },
  "RabbitMQ": {
    "HostName": "localhost"
  }
}
```

### User Secrets (for Development)
```bash
# Initialize user secrets
dotnet user-secrets init

# Set secrets
dotnet user-secrets set "JwtSettings:Key" "your-secret-key"
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "connection-string"
```

## 🚨 Important Security Notes

⚠️ **DO NOT commit sensitive data:**
- `.gitignore` excludes `appsettings.Development.json`
- Never commit hardcoded secrets
- Use environment variables or user-secrets for sensitive data
- Rotate JWT keys in production
- Use HTTPS in production

## 📞 Support & Contribution

For issues, feature requests, or contributions, please:
1. Open an issue describing the problem
2. Fork the repository
3. Create a feature branch
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

- **Admin User** - Initial implementation

## 🎉 Acknowledgments

- Clean Architecture principles
- ASP.NET Core best practices
- Community feedback and contributions

---

**Last Updated:** April 2026

