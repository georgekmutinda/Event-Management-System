# User Management Testing Guide

## Overview

This guide provides comprehensive testing instructions for the User Management endpoints in the Event Management System.

---

## Part 1: Automated Testing

### Running Unit Tests

Unit tests are in `EventManagementApi.Tests/Unit/Services/UserServiceTests.cs`

**Command**:
```bash
dotnet test EventManagementApi.Tests.csproj -v normal -l "console;verbosity=detailed"
```

**What's Tested**:
- GetAllUsersAsync (returns list, handles empty)
- GetUserByEmailAsync (finds user, throws on not found)
- GetUserByIdAsync (finds user, throws on not found)
- UpdateUserAsync (updates fields, validates email uniqueness)
- DeleteUserAsync (deletes user, handles not found)

**Expected Result**: ✅ All tests PASS

---

### Running Integration Tests

Integration tests are in `EventManagementApi.Tests/Integration/Controllers/UserControllerIntegrationTests.cs`

**Command**:
```bash
dotnet test EventManagementApi.Tests.csproj -v normal -l "console;verbosity=detailed" -k "Integration"
```

**What's Tested**:
- Full HTTP request/response pipeline
- Status codes (200, 400, 404)
- JSON serialization/deserialization
- Database interactions

**Expected Result**: ✅ All tests PASS

---

### Running All Tests

**Command**:
```bash
dotnet test EventManagementApi.Tests.csproj -v normal
```

**Expected Output**:
```
Test Run Successful.
Total tests: XX
Passed: XX
Failed: 0
Skipped: 0
```

---

### Test Coverage

**Command** (requires coverlet):
```bash
dotnet test EventManagementApi.Tests.csproj /p:CollectCoverage=true /p:CoverageFormat=opencover
```

---

## Part 2: Manual Testing with Postman

### Prerequisites

1. Start the API:
```bash
cd EventManagementApi
dotnet run
```

API will be available at: `https://localhost:7157/api`

2. Open Postman or similar REST client

3. Create a new collection called "User Management Tests"

---

### Test 1: Get All Users

**Request**:
```
GET https://localhost:7157/api/users
```

**Expected Response**:
```
Status: 200 OK

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

**Test Cases**:
- [ ] Returns 200 OK
- [ ] Returns list of users
- [ ] Does not contain PasswordHash
- [ ] Returns empty list if no users

---

### Test 2: Get User by Email

**Request**:
```
GET https://localhost:7157/api/users/email/john@example.com
```

**Expected Response** (User Found):
```
Status: 200 OK

{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Expected Response** (Not Found):
```
Status: 404 Not Found

{
  "message": "User with email 'nonexistent@example.com' not found"
}
```

**Test Cases**:
- [ ] Returns 200 OK for existing email
- [ ] Returns correct user data
- [ ] Returns 404 for non-existent email
- [ ] Error message is descriptive

---

### Test 3: Get User by ID

**Request**:
```
GET https://localhost:7157/api/users/1
```

**Expected Response** (User Found):
```
Status: 200 OK

{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Expected Response** (Not Found):
```
Status: 404 Not Found

{
  "message": "User with ID '999' not found"
}
```

**Test Cases**:
- [ ] Returns 200 OK for existing ID
- [ ] Returns correct user data
- [ ] Returns 404 for non-existent ID

---

### Test 4: Update User (Full Update)

**Request**:
```
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "fullName": "John Updated",
  "email": "john.updated@example.com"
}
```

**Expected Response**:
```
Status: 200 OK

{
  "id": 1,
  "fullName": "John Updated",
  "email": "john.updated@example.com"
}
```

**Test Cases**:
- [ ] Returns 200 OK
- [ ] Updates both fields
- [ ] FullName changed
- [ ] Email changed

---

### Test 5: Update User (Partial Update - FullName Only)

**Request**:
```
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "fullName": "John New Name",
  "email": null
}
```

**Expected Response**:
```
Status: 200 OK

{
  "id": 1,
  "fullName": "John New Name",
  "email": "john@example.com"  // Unchanged
}
```

**Test Cases**:
- [ ] Returns 200 OK
- [ ] FullName updated
- [ ] Email unchanged
- [ ] Supports partial updates

---

### Test 6: Update User (Partial Update - Email Only)

**Request**:
```
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "fullName": null,
  "email": "newemail@example.com"
}
```

**Expected Response**:
```
Status: 200 OK

{
  "id": 1,
  "fullName": "John Doe",  // Unchanged
  "email": "newemail@example.com"
}
```

**Test Cases**:
- [ ] Returns 200 OK
- [ ] FullName unchanged
- [ ] Email updated

---

### Test 7: Update User (No Fields Provided)

**Request**:
```
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "fullName": null,
  "email": null
}
```

**Expected Response**:
```
Status: 400 Bad Request

{
  "message": "At least one field (FullName or Email) must be provided"
}
```

**Test Cases**:
- [ ] Returns 400 Bad Request
- [ ] Error message is clear
- [ ] No update occurs

---

### Test 8: Update User (Empty Strings)

**Request**:
```
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "fullName": "",
  "email": ""
}
```

**Expected Response**:
```
Status: 400 Bad Request

{
  "message": "At least one field (FullName or Email) must be provided"
}
```

**Test Cases**:
- [ ] Returns 400 Bad Request
- [ ] Handles empty strings as invalid

---

### Test 9: Update User (Duplicate Email)

First, create or verify you have 2 users:
- User 1: email = "user1@example.com"
- User 2: email = "user2@example.com"

**Request**:
```
PUT https://localhost:7157/api/users/1
Content-Type: application/json

{
  "email": "user2@example.com"
}
```

**Expected Response**:
```
Status: 400 Bad Request

{
  "message": "Email 'user2@example.com' is already in use"
}
```

**Test Cases**:
- [ ] Returns 400 Bad Request
- [ ] Prevents duplicate email
- [ ] Error message is descriptive

---

### Test 10: Update User (Non-Existent User)

**Request**:
```
PUT https://localhost:7157/api/users/999
Content-Type: application/json

{
  "fullName": "New Name"
}
```

**Expected Response**:
```
Status: 400 Bad Request

{
  "message": "User with ID '999' not found"
}
```

**Test Cases**:
- [ ] Returns 400 Bad Request (or 404)
- [ ] Error message is clear

---

### Test 11: Delete User (Success)

**Request**:
```
DELETE https://localhost:7157/api/users/1
```

**Expected Response**:
```
Status: 200 OK

{
  "message": "User deleted successfully"
}
```

**Verification**:
1. Run: `GET https://localhost:7157/api/users/1`
2. Should return: `404 Not Found`

**Test Cases**:
- [ ] Returns 200 OK
- [ ] User is actually deleted
- [ ] Subsequent GET returns 404

---

### Test 12: Delete User (Not Found)

**Request**:
```
DELETE https://localhost:7157/api/users/999
```

**Expected Response**:
```
Status: 404 Not Found

{
  "message": "User with ID '999' not found"
}
```

**Test Cases**:
- [ ] Returns 404 Not Found
- [ ] Error message is clear

---

## Part 3: Manual Testing with Swagger/OpenAPI

### Access Swagger UI

1. Start the API:
```bash
dotnet run
```

2. Navigate to: `https://localhost:7157/swagger`

3. All endpoints will be listed and interactive

### Available Endpoints in Swagger

- **GET** `/api/users` - Get all users
- **GET** `/api/users/email/{email}` - Get user by email
- **GET** `/api/users/{id}` - Get user by ID
- **PUT** `/api/users/{id}` - Update user
- **DELETE** `/api/users/{id}` - Delete user

### Testing in Swagger

1. Click on any endpoint
2. Click "Try it out"
3. Fill in parameters (if required)
4. Click "Execute"
5. Review response status and body

---

## Part 4: Test Data Setup

### Option 1: Create Test Users via API

Use the Auth endpoint to register test users:

```
POST https://localhost:7157/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User 1",
  "email": "testuser1@example.com",
  "password": "TestPassword123!",
  "roles": ["User"]
}
```

### Option 2: Database Seeding

Insert directly into database:

```sql
INSERT INTO "User" (FullName, Email, PasswordHash)
VALUES 
  ('John Doe', 'john@example.com', '$2a$11$...'),
  ('Jane Smith', 'jane@example.com', '$2a$11$...'),
  ('Bob Johnson', 'bob@example.com', '$2a$11$...');
```

---

## Part 5: Edge Cases to Test

### Email Validation
- [ ] Valid email: user@example.com ✓
- [ ] Email with plus: user+tag@example.com ✓
- [ ] International domain: user@example.co.uk ✓

### Name Validation
- [ ] Single character: A
- [ ] Long name: Multiple words
- [ ] Special characters: O'Brien
- [ ] Whitespace: "  John Doe  " (should be trimmed)

### Concurrent Operations
- [ ] Multiple simultaneous GET requests
- [ ] Multiple simultaneous PUT requests
- [ ] DELETE while another operation is in progress

### Data Integrity
- [ ] Email uniqueness across all users
- [ ] ID immutability (cannot change UserId)
- [ ] PasswordHash never exposed in API

---

## Part 6: Performance Testing

### Load Test Example (using Apache Bench)

```bash
# Single request
ab -n 1 -c 1 https://localhost:7157/api/users

# 100 concurrent requests
ab -n 100 -c 10 https://localhost:7157/api/users
```

### Expected Performance
- **GET all users**: < 100ms
- **GET by email**: < 50ms
- **GET by ID**: < 50ms
- **PUT**: < 100ms
- **DELETE**: < 100ms

---

## Part 7: Troubleshooting

### Tests Fail with "Database already exists"
**Solution**:
```bash
dotnet test --no-build
```

### Connection String Issues in Tests
**Check**: Ensure in-memory database is configured in test setup

### AutoMapper Errors
**Solution**: Verify UserProfile is loaded in service configuration

### Port Already in Use
**Solution**:
```bash
# Find process using port 7157
netstat -ano | findstr 7157

# Kill the process
taskkill /PID <PID> /F
```

---

## Part 8: Test Checklist

### Unit Tests ✓
- [ ] All service methods tested
- [ ] Mocking is working correctly
- [ ] Exception handling tested
- [ ] Edge cases covered

### Integration Tests ✓
- [ ] All endpoints tested
- [ ] Status codes correct
- [ ] JSON serialization working
- [ ] Database interactions verified

### Manual Tests ✓
- [ ] All endpoints tested in Postman
- [ ] All response codes verified
- [ ] All error cases handled
- [ ] Edge cases tested

### Regression Tests
- [ ] Existing functionality not broken
- [ ] Performance acceptable
- [ ] Security maintained
- [ ] Data integrity verified

---

## Part 9: Continuous Integration

### GitHub Actions Example

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '10.0'
      - run: dotnet test --no-build
```

---

## Part 10: Documentation

### Test Report Template

```
Test Execution Report
====================

Date: YYYY-MM-DD
Executed By: [Name]

Summary
-------
- Total Tests: XX
- Passed: XX
- Failed: 0
- Duration: XX seconds

Unit Tests
----------
- UserServiceTests: ✓ PASS

Integration Tests
-----------------
- UserControllerIntegrationTests: ✓ PASS

Issues Found
-----------
- None

Recommendations
--------------
- All tests passing
- Code ready for deployment
```

---

## Summary

### Quick Commands

```bash
# Run all tests
dotnet test

# Run with verbose output
dotnet test -v normal

# Run specific test class
dotnet test -k "UserServiceTests"

# Run with code coverage
dotnet test /p:CollectCoverage=true

# Run integration tests only
dotnet test -k "Integration"
```

### Key Success Criteria

✅ All unit tests passing  
✅ All integration tests passing  
✅ Manual tests in Postman all successful  
✅ No database errors  
✅ No security issues  
✅ Response times acceptable  

---

**Test Status: FULLY READY FOR DEPLOYMENT** ✓
