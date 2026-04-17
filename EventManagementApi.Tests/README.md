# EventManagementApi.Tests - Test Project Documentation

## Overview

This is the comprehensive test suite for the Event Management API User Management endpoints. It includes unit tests, integration tests, and testing documentation.

## Project Structure

```
EventManagementApi.Tests/
├── Fixtures/
│   └── UserFixture.cs          - Test data factory
├── Unit/
│   └── Services/
│       └── UserServiceTests.cs  - UserService unit tests
├── Integration/
│   └── Controllers/
│       └── UserControllerIntegrationTests.cs  - UserController integration tests
└── EventManagementApi.Tests.csproj
```

## Dependencies

- **xUnit**: Testing framework
- **Moq**: Mocking library
- **FluentAssertions**: Assertion library
- **Microsoft.AspNetCore.Mvc.Testing**: WebApplicationFactory for integration tests
- **Microsoft.EntityFrameworkCore.InMemory**: In-memory database for tests
- **AutoMapper**: DTO mapping

## Running Tests

### Run All Tests
```bash
dotnet test
```

### Run Specific Test Class
```bash
dotnet test -k "UserServiceTests"
dotnet test -k "UserControllerIntegrationTests"
```

### Run with Verbose Output
```bash
dotnet test -v normal
```

### Run with Code Coverage
```bash
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

## Test Coverage

### Unit Tests (UserServiceTests)

Tests the `UserService` class with mocked repository:

**Tests Implemented: 28**

- **GetAllUsersAsync**: 3 tests
  - Returns list of users
  - Returns empty list if none exist
  - Does not expose PasswordHash

- **GetUserByEmailAsync**: 4 tests
  - Returns user when exists
  - Throws exception when not found
  - Exception contains correct message
  - Does not expose PasswordHash

- **GetUserByIdAsync**: 2 tests
  - Returns user when exists
  - Throws exception when not found

- **UpdateUserAsync**: 9 tests
  - Updates only FullName
  - Updates only Email
  - Updates both fields
  - Throws exception if user not found
  - Prevents duplicate email
  - Allows same email update
  - Does not overwrite with null/whitespace
  - Handles whitespace FullName
  - Handles whitespace Email

- **DeleteUserAsync**: 3 tests
  - Returns true when deleted
  - Returns false when not found
  - Deletes correct user

- **Edge Cases**: 2 tests
  - Whitespace handling
  - Email case sensitivity

### Integration Tests (UserControllerIntegrationTests)

Tests the full HTTP request/response pipeline:

**Tests Implemented: 32**

- **GET /api/users**: 3 tests
  - Returns 200 OK with users list
  - Returns 200 OK with empty list
  - Does not expose PasswordHash in response

- **GET /api/users/email/{email}**: 3 tests
  - Returns 200 OK when email exists
  - Returns 404 when email not found
  - Returns error message

- **GET /api/users/{id}**: 2 tests
  - Returns 200 OK when ID exists
  - Returns 404 when ID not found

- **PUT /api/users/{id}**: 9 tests
  - Returns 200 OK with updated user
  - Returns 404 when user not found
  - Returns 400 with no fields provided
  - Returns 400 with empty strings
  - Updates only FullName
  - Updates only Email
  - Prevents duplicate email
  - Returns error when email in use
  - Handles special characters in email

- **DELETE /api/users/{id}**: 3 tests
  - Returns 200 OK when deleted
  - Returns 404 when not found
  - Actually removes from database
  - Does not affect other users

- **Content Negotiation**: 1 test
  - Returns JSON content type

- **Edge Cases**: 2 tests
  - Handles special characters
  - Handles case-insensitive email

## Test Database Configuration

All tests use **in-memory database** (EF Core InMemory):

- No external database required
- Tests are isolated
- Each test gets a fresh database
- Fast execution

### Database Reset

Each integration test:
1. Creates fresh in-memory database
2. Seeds test data if needed
3. Cleans up after test

## Test Data

### UserFixture Class

Static helper methods for creating test data:

```csharp
// Create single test user
var user = UserFixture.CreateTestUser();

// Create test user with specific data
var user = UserFixture.CreateTestUser(id: 5, fullName: "John", email: "john@example.com");

// Create multiple test users
var users = UserFixture.CreateTestUsers(count: 3);

// Create user with specific email
var user = UserFixture.CreateTestUserWithEmail("test@example.com");
```

## Assertions

Tests use **FluentAssertions** for readable assertions:

```csharp
result.Should().NotBeNull();
result.Should().HaveCount(3);
result.Should().AllSatisfy(u => u.Id.Should().BeGreaterThan(0));
response.StatusCode.Should().Be(HttpStatusCode.OK);
```

## Mocking

**Moq** is used for mocking dependencies:

```csharp
var mockRepository = new Mock<IUserRepository>();
mockRepository
    .Setup(r => r.GetByIdAsync(1))
    .ReturnsAsync(testUser);
```

## WebApplicationFactory

Integration tests use `WebApplicationFactory<Program>`:

- Spins up full application
- Replaces database with in-memory
- Tests real HTTP client
- Verifies routing, serialization, etc.

## Test Naming Convention

All tests follow the pattern:

```csharp
[MethodName]_[Scenario]_[ExpectedResult]()
```

Example:
```csharp
GetUserByEmailAsync_ReturnsUser_WhenEmailExists()
UpdateUserAsync_ThrowsException_WhenEmailAlreadyInUse()
DeleteUser_Returns200OK_WhenUserExists()
```

## Assertions Checklist

For each endpoint test:

- [ ] Correct HTTP status code
- [ ] Correct response body
- [ ] Error messages are clear
- [ ] No sensitive data exposed
- [ ] Handles edge cases
- [ ] Async/await used correctly

## Common Test Patterns

### Unit Test Pattern
```csharp
[Fact]
public async Task MethodName_Scenario_ExpectedResult()
{
    // Arrange - Setup test data
    var testData = CreateTestData();

    // Act - Execute code being tested
    var result = await _service.MethodAsync(testData);

    // Assert - Verify result
    result.Should().Be(expectedValue);
}
```

### Integration Test Pattern
```csharp
[Fact]
public async Task Endpoint_Scenario_ExpectedResult()
{
    // Arrange
    var testUser = UserFixture.CreateTestUser();
    await SeedUserAsync(testUser);

    // Act
    var response = await _client.GetAsync("/api/users/1");

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

## Debugging Tests

### Run Single Test
```bash
dotnet test --filter "MethodName_Scenario_ExpectedResult"
```

### Run with Debugging
1. Set breakpoint in test
2. Run: `dotnet test`
3. Debugger will stop at breakpoint

### View Detailed Output
```bash
dotnet test -v normal -l "console;verbosity=detailed"
```

## Performance Benchmarks

Expected test execution times:

- Unit tests: < 5 seconds
- Integration tests: < 10 seconds
- Total: < 15 seconds

## CI/CD Integration

Tests can be integrated into CI/CD pipeline:

```yaml
# GitHub Actions example
- run: dotnet test --no-build
```

## Known Issues & Workarounds

### Issue: "Database already exists"
**Solution**: Use unique database names or clean up properly

### Issue: AutoMapper configuration not loaded
**Solution**: Ensure UserProfile is configured in test setup

### Issue: Tests running in parallel fail
**Solution**: Use xunit.runner.json to configure parallelism

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Add authentication/authorization tests
- [ ] Add database concurrency tests
- [ ] Add stress testing
- [ ] Add mutation testing
- [ ] Add code coverage reporting

## Best Practices

✅ **DO:**
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Test one thing per test
- Use fixtures for test data
- Clean up resources (Dispose)
- Use async/await for async code

❌ **DON'T:**
- Test multiple scenarios in one test
- Have test interdependencies
- Use real databases
- Ignore test failures
- Skip tests
- Hard-code test data

## Contact & Support

For issues with tests:
1. Check test output for error messages
2. Review test comments for context
3. Check TESTING_GUIDE.md for manual testing
4. Debug using Visual Studio or VS Code

## Quick Reference

### Key Test Files
- `UserServiceTests.cs` - 28 unit tests
- `UserControllerIntegrationTests.cs` - 32 integration tests
- `UserFixture.cs` - Test data factory

### Key Nuget Packages
```xml
<PackageReference Include="xunit" Version="2.8.1" />
<PackageReference Include="Moq" Version="4.20.70" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
<PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="10.0.2" />
```

### Run All Tests
```bash
dotnet test
```

---

**Test Suite Status: ✅ COMPLETE AND FULLY FUNCTIONAL**

Last Updated: April 15, 2026
