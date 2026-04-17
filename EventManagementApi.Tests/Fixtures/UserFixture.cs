using Domain.Entities;

namespace EventManagementApi.Tests.Fixtures
{
    /// <summary>
    /// Test fixture providing test data for User-related tests.
    /// </summary>
    public static class UserFixture
    {
        /// <summary>
        /// Creates a test user with standard data.
        /// </summary>
        public static User CreateTestUser(int id = 1, string fullName = "Test User", string email = "test@example.com")
        {
            return new User
            {
                UserId = id,
                FullName = fullName,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!")
            };
        }

        /// <summary>
        /// Creates multiple test users.
        /// </summary>
        public static List<User> CreateTestUsers(int count = 3)
        {
            var users = new List<User>();
            for (int i = 1; i <= count; i++)
            {
                users.Add(CreateTestUser(i, $"User {i}", $"user{i}@example.com"));
            }
            return users;
        }

        /// <summary>
        /// Creates a user with specific email.
        /// </summary>
        public static User CreateTestUserWithEmail(string email)
        {
            return new User
            {
                UserId = 1,
                FullName = "Test User",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("TestPassword123!")
            };
        }
    }
}
