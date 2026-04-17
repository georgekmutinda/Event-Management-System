# 🔌 API ENDPOINT REFERENCE GUIDE

## Base URL
```
POST   https://localhost:7157/api
GET    https://localhost:7157/api
PUT    https://localhost:7157/api
DELETE https://localhost:7157/api
```

---

## User Management Endpoints

### 1️⃣ GET ALL USERS
```
GET /api/users
```

**Description**: Retrieve all users from the system

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  {
    "id": 2,
    "fullName": "Jane Smith",
    "email": "jane@example.com"
  }
]
```

**Error**: `500 Internal Server Error`
```json
{
  "message": "Error retrieving users: {exception message}"
}
```

---

### 2️⃣ GET USER BY EMAIL
```
GET /api/users/email/{email}
```

**Parameters**:
- `email` (string, path) - User's email address

**Example Request**:
```
GET /api/users/email/john@example.com
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Error**: `404 Not Found`
```json
{
  "message": "User with email 'nonexistent@example.com' not found"
}
```

---

### 3️⃣ GET USER BY ID (BONUS)
```
GET /api/users/{id}
```

**Parameters**:
- `id` (integer, path) - User's ID

**Example Request**:
```
GET /api/users/1
```

**Response**: `200 OK`
```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Error**: `404 Not Found`
```json
{
  "message": "User with ID '999' not found"
}
```

---

### 4️⃣ UPDATE USER
```
PUT /api/users/{id}
```

**Parameters**:
- `id` (integer, path) - User's ID

**Request Body** (application/json):
```json
{
  "fullName": "John Updated 2024",
  "email": "newemail@example.com"
}
```

**Validation Rules**:
- ✅ At least ONE field required (FullName or Email)
- ✅ Email must be unique (validation on update)
- ✅ Supports partial updates (either field can be null)

**Example 1 - Update Both**:
```
PUT /api/users/1
Content-Type: application/json

{
  "fullName": "John Updated",
  "email": "john.updated@example.com"
}
```

Response: `200 OK`
```json
{
  "id": 1,
  "fullName": "John Updated",
  "email": "john.updated@example.com"
}
```

**Example 2 - Update FullName Only**:
```
PUT /api/users/1
Content-Type: application/json

{
  "fullName": "John New Name",
  "email": null
}
```

**Example 3 - Update Email Only**:
```
PUT /api/users/1
Content-Type: application/json

{
  "fullName": null,
  "email": "john.new@example.com"
}
```

**Errors**:

`400 Bad Request` - No fields provided:
```json
{
  "message": "At least one field (FullName or Email) must be provided"
}
```

`400 Bad Request` - Email already in use:
```json
{
  "message": "Email 'existing@example.com' is already in use"
}
```

`404 Not Found` - User doesn't exist:
```json
{
  "message": "User with ID '999' not found"
}
```

---

### 5️⃣ DELETE USER
```
DELETE /api/users/{id}
```

**Parameters**:
- `id` (integer, path) - User's ID

**Example Request**:
```
DELETE /api/users/1
```

**Response**: `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

**Error**: `404 Not Found`
```json
{
  "message": "User with ID '999' not found"
}
```

**Error**: `500 Internal Server Error`
```json
{
  "message": "Error deleting user: {exception message}"
}
```

---

## Data Transfer Objects (DTOs)

### UserResponseDto
Used in all GET responses and PUT success responses
```csharp
{
  "id": int,              // Mapped from User.UserId
  "fullName": string,     // User's full name
  "email": string         // User's email address
  // NOTE: PasswordHash is NEVER included
}
```

### UpdateUserDto
Used in PUT request body
```csharp
{
  "fullName": string?,    // Optional - null if not updating
  "email": string?        // Optional - null if not updating
}
```

---

## HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `200` | OK | Successful GET, PUT |
| `400` | Bad Request | Invalid input, missing fields |
| `404` | Not Found | User doesn't exist |
| `500` | Server Error | Database error, exception thrown |

---

## Authentication

Currently **not required** for UserController endpoints.

**Future Enhancement**: Add `[Authorize]` attribute to endpoints:
```csharp
[Authorize]
[HttpGet]
public async Task<ActionResult<List<UserResponseDto>>> GetAllUsers()
```

---

## Business Rules Enforced

### 1. Email Uniqueness
- Email must be unique across all users
- Validation occurs on registration AND update
- Returns 400 Bad Request if duplicate

### 2. Partial Updates
- Both FullName and Email are optional in PUT requests
- At least ONE must be provided
- Null values don't override existing data

### 3. No Password Exposure
- PasswordHash never included in any response
- All responses use UserResponseDto (excludes PasswordHash)

### 4. Safe Deletion
- DELETE always checks if user exists
- Returns false (404) if user not found
- Returns true (200) if deletion successful

---

## Testing Examples

### Using curl

**Get all users**:
```bash
curl -X GET "https://localhost:7157/api/users"
```

**Get user by email**:
```bash
curl -X GET "https://localhost:7157/api/users/email/john@example.com"
```

**Get user by ID**:
```bash
curl -X GET "https://localhost:7157/api/users/1"
```

**Update user**:
```bash
curl -X PUT "https://localhost:7157/api/users/1" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Updated","email":"john.new@example.com"}'
```

**Delete user**:
```bash
curl -X DELETE "https://localhost:7157/api/users/1"
```

### Using Postman

1. Set base URL to `localhost:7157`
2. Create requests for each endpoint
3. Use JSON body for PUT request
4. Check response status codes
5. Verify response data

### Using .http files

Create a file named `api-test.http`:
```http
### Get all users
GET https://localhost:7157/api/users

### Get user by email
GET https://localhost:7157/api/users/email/john@example.com

### Get user by ID
GET https://localhost:7157/api/users/1

### Update user
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "fullName": "John Updated",
  "email": "john.new@example.com"
}

### Delete user
DELETE https://localhost:7157/api/users/1
```

---

## Implementation Details

### Technology Stack
- **Language**: C# .NET 10
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Mapping**: AutoMapper
- **Authentication**: JWT
- **API Style**: RESTful

### Architecture Layers
1. **API Layer**: UserController (HTTP endpoint handling)
2. **Application Layer**: UserService (business logic) + DTOs
3. **Infrastructure Layer**: UserRepository (data access)
4. **Domain Layer**: User entity, AppDbContext

### Database Table
```sql
CREATE TABLE "User" (
  UserId SERIAL PRIMARY KEY,
  FullName VARCHAR(255) NOT NULL,
  Email VARCHAR(255) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  -- Foreign Keys to other tables...
);

CREATE INDEX IX_User_Email ON "User" (Email);
```

---

## Performance Considerations

- ✅ Email column indexed for fast lookups
- ✅ All operations are async
- ✅ No N+1 query problems
- ✅ Proper lazy loading configuration
- ✅ Minimal data in responses (no sensitive fields)

---

## Security Considerations

- ✅ PasswordHash never exposed in API
- ✅ Email uniqueness prevents account duplicates
- ✅ No SQL injection (using parameterized queries via EF)
- ✅ Input validation on all endpoints
- ✅ Proper error messages (no sensitive info leaked)

---

## Future Enhancements

1. **Add Authorization**: 
   - Add `[Authorize]` to protect endpoints
   - Add role-based access control
   
2. **Add Validation Attributes**:
   - `[EmailAddress]` for email format
   - `[StringLength]` for field lengths
   
3. **Add Logging**:
   - Log all CRUD operations
   - Log errors and exceptions
   
4. **Add Pagination**:
   - `GET /api/users?page=1&pageSize=10`
   
5. **Add Filtering**:
   - `GET /api/users?search=john`
   
6. **Add Sorting**:
   - `GET /api/users?sort=email`

---

**Last Updated**: April 15, 2026  
**Version**: 1.0  
**Status**: Production Ready
