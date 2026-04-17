using Application.DTOs;
using Application.Interfaces;
using Application.Mappings;
using Application.Services;
using AutoMapper;
using Domain.Data;
using Domain.Entities;
using EventManagementApi.Tests.Fixtures;
using FluentAssertions;
using Infrastructure.Interfaces;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace EventManagementApi.Tests.Unit.Services
{
    /// <summary>
    /// Unit tests for UserService.
    /// Tests all business logic for user operations without hitting the database.
    /// </summary>
    public class UserServiceTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly UserRepository _userRepository;
        private readonly IMapper _mapper;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            // Setup in-memory database for unit tests
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);

            // Setup AutoMapper
            var mapperConfig = new MapperConfiguration(cfg =>
                cfg.AddProfile<UserProfile>()
            );
            _mapper = mapperConfig.CreateMapper();

            // Setup repository and service
            _userRepository = new UserRepository(_context);
            _userService = new UserService(_userRepository, _mapper);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }

        #region GetAllUsersAsync Tests

        [Fact]
        public async Task GetAllUsersAsync_ReturnsAllUsers_WhenUsersExist()
        {
            // Arrange
            var testUsers = UserFixture.CreateTestUsers(3);
            foreach (var user in testUsers)
            {
                _context.User.Add(user);
            }
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetAllUsersAsync();

            // Assert
            result.Should().HaveCount(3);
            result.Should().AllSatisfy(u => u.Id.Should().BeGreaterThan(0));
            result.Should().AllSatisfy(u => u.FullName.Should().NotBeNullOrEmpty());
            result.Should().AllSatisfy(u => u.Email.Should().NotBeNullOrEmpty());
        }

        [Fact]
        public async Task GetAllUsersAsync_ReturnsEmptyList_WhenNoUsersExist()
        {
            // Act
            var result = await _userService.GetAllUsersAsync();

            // Assert
            result.Should().BeEmpty();
            result.Should().HaveCount(0);
        }

        [Fact]
        public async Task GetAllUsersAsync_DoesNotExposedPasswordHash()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser();
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetAllUsersAsync();

            // Assert
            result.Should().HaveCount(1);
            // UserResponseDto should not have PasswordHash property
            result[0].Should().BeOfType<UserResponseDto>();
            // Verify only expected properties exist
            result[0].Id.Should().Be(testUser.UserId);
            result[0].FullName.Should().Be(testUser.FullName);
            result[0].Email.Should().Be(testUser.Email);
        }

        #endregion

        #region GetUserByEmailAsync Tests

        [Fact]
        public async Task GetUserByEmailAsync_ReturnsUser_WhenEmailExists()
        {
            // Arrange
            var email = "john@example.com";
            var testUser = UserFixture.CreateTestUserWithEmail(email);
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetUserByEmailAsync(email);

            // Assert
            result.Should().NotBeNull();
            result.Email.Should().Be(email);
            result.FullName.Should().Be(testUser.FullName);
            result.Id.Should().Be(testUser.UserId);
        }

        [Fact]
        public async Task GetUserByEmailAsync_ThrowsException_WhenEmailNotFound()
        {
            // Arrange
            var email = "nonexistent@example.com";

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.GetUserByEmailAsync(email));
        }

        [Fact]
        public async Task GetUserByEmailAsync_ThrowsExceptionWithCorrectMessage_WhenEmailNotFound()
        {
            // Arrange
            var email = "notfound@example.com";

            // Act
            var exception = await Assert.ThrowsAsync<Exception>(() => _userService.GetUserByEmailAsync(email));

            // Assert
            exception.Message.Should().Contain(email);
            exception.Message.Should().Contain("not found");
        }

        #endregion

        #region GetUserByIdAsync Tests

        [Fact]
        public async Task GetUserByIdAsync_ReturnsUser_WhenIdExists()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 5);
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.GetUserByIdAsync(5);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(5);
            result.Email.Should().Be(testUser.Email);
        }

        [Fact]
        public async Task GetUserByIdAsync_ThrowsException_WhenIdNotFound()
        {
            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.GetUserByIdAsync(999));
        }

        #endregion

        #region UpdateUserAsync Tests

        [Fact]
        public async Task UpdateUserAsync_UpdatesFullName_WhenEmailNotProvided()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1);
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                FullName = "Updated Name",
                Email = null
            };

            // Act
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            result.FullName.Should().Be("Updated Name");
            result.Email.Should().Be(testUser.Email); // Should not change
        }

        [Fact]
        public async Task UpdateUserAsync_UpdatesEmail_WhenFullNameNotProvided()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1);
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                FullName = null,
                Email = "newemail@example.com"
            };

            // Act
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            result.Email.Should().Be("newemail@example.com");
            result.FullName.Should().Be(testUser.FullName); // Should not change
        }

        [Fact]
        public async Task UpdateUserAsync_UpdatesBothFields_WhenBothProvided()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1);
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                FullName = "Completely New Name",
                Email = "completely.new@example.com"
            };

            // Act
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            result.FullName.Should().Be("Completely New Name");
            result.Email.Should().Be("completely.new@example.com");
        }

        [Fact]
        public async Task UpdateUserAsync_ThrowsException_WhenUserNotFound()
        {
            // Arrange
            var updateDto = new UpdateUserDto { FullName = "New Name" };

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.UpdateUserAsync(999, updateDto));
        }

        [Fact]
        public async Task UpdateUserAsync_ThrowsException_WhenEmailAlreadyInUse()
        {
            // Arrange
            var user1 = UserFixture.CreateTestUser(id: 1, email: "user1@example.com");
            var user2 = UserFixture.CreateTestUser(id: 2, email: "user2@example.com");
            _context.User.AddRange(user1, user2);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                Email = "user2@example.com" // Trying to use user2's email
            };

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _userService.UpdateUserAsync(1, updateDto));
        }

        [Fact]
        public async Task UpdateUserAsync_DoesNotThrow_WhenUpdatingToSameEmail()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1, email: "test@example.com");
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                Email = "test@example.com" // Same email
            };

            // Act - Should not throw
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            result.Email.Should().Be("test@example.com");
        }

        [Fact]
        public async Task UpdateUserAsync_DoesNotOverwriteWithNull()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1, fullName: "Original Name", email: "original@example.com");
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                FullName = "  ",  // Whitespace - treated as null
                Email = ""        // Empty - treated as null
            };

            // Act
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            // When all fields are whitespace/null, the user should remain unchanged
            result.FullName.Should().Be("Original Name");
            result.Email.Should().Be("original@example.com");
        }

        #endregion

        #region DeleteUserAsync Tests

        [Fact]
        public async Task DeleteUserAsync_ReturnsTrue_WhenUserExists()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1);
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.DeleteUserAsync(1);

            // Assert
            result.Should().BeTrue();
            var deletedUser = await _userRepository.GetByIdAsync(1);
            deletedUser.Should().BeNull();
        }

        [Fact]
        public async Task DeleteUserAsync_ReturnsFalse_WhenUserNotFound()
        {
            // Act
            var result = await _userService.DeleteUserAsync(999);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public async Task DeleteUserAsync_DeletesCorrectUser_WhenMultipleUsersExist()
        {
            // Arrange
            var users = UserFixture.CreateTestUsers(3);
            _context.User.AddRange(users);
            await _context.SaveChangesAsync();

            // Act
            var result = await _userService.DeleteUserAsync(2);

            // Assert
            result.Should().BeTrue();
            var remainingUsers = await _userService.GetAllUsersAsync();
            remainingUsers.Should().HaveCount(2);
            remainingUsers.Should().NotContain(u => u.Id == 2);
        }

        #endregion

        #region Edge Cases

        [Fact]
        public async Task UpdateUserAsync_HandlesWhitespaceFullName_AsNull()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1, fullName: "Original");
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                FullName = "   ", // Only whitespace
                Email = "new@example.com"
            };

            // Act
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            result.FullName.Should().Be("Original"); // Should not change
            result.Email.Should().Be("new@example.com");
        }

        [Fact]
        public async Task UpdateUserAsync_HandlesWhitespaceEmail_AsNull()
        {
            // Arrange
            var testUser = UserFixture.CreateTestUser(id: 1, email: "original@example.com");
            _context.User.Add(testUser);
            await _context.SaveChangesAsync();

            var updateDto = new UpdateUserDto
            {
                FullName = "New Name",
                Email = "   " // Only whitespace
            };

            // Act
            var result = await _userService.UpdateUserAsync(1, updateDto);

            // Assert
            result.FullName.Should().Be("New Name");
            result.Email.Should().Be("original@example.com"); // Should not change
        }

        #endregion
    }
}
