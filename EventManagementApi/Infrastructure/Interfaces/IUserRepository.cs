using Domain.Entities;

namespace Infrastructure.Interfaces
{
    /// <summary>
    /// Repository interface for User entity data access operations.
    /// Provides abstraction for database operations on User table.
    /// </summary>
    public interface IUserRepository
    {
        // ========== EXISTING METHODS (Auth) ==========
        Task<User?> GetByEmailAsync(string email);
        Task AddUserAsync(User user);
        Task<Role?> GetRoleByNameAsync(string roleName);
        Task AddUserRoleAsync(UserRole userRole);
        Task<List<Role>> GetUserRolesAsync(int userId);

        // ========== NEW METHODS (User Management) ==========
        /// <summary>
        /// Retrieves all users from the database.
        /// </summary>
        Task<List<User>> GetAllAsync();

        /// <summary>
        /// Retrieves a user by their ID.
        /// Returns null if user not found.
        /// </summary>
        Task<User?> GetByIdAsync(int id);

        /// <summary>
        /// Updates an existing user in the database.
        /// </summary>
        Task UpdateAsync(User user);

        /// <summary>
        /// Deletes a user from the database.
        /// </summary>
        Task DeleteAsync(User user);
    }
}