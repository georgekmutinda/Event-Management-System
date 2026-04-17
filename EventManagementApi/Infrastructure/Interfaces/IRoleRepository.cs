using Domain.Entities;

namespace Infrastructure.Interfaces
{
    /// <summary>
    /// Repository interface for Role entity data access operations.
    /// Provides abstraction for database operations on Role table.
    /// </summary>
    public interface IRoleRepository
    {
        /// <summary>
        /// Retrieves all roles from the database.
        /// </summary>
        Task<List<Role>> GetAllAsync();

        /// <summary>
        /// Retrieves a single role by ID.
        /// Returns null if role not found.
        /// </summary>
        Task<Role?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves a role by its name.
        /// Returns null if role not found.
        /// Used for checking duplicate role names.
        /// </summary>
        Task<Role?> GetByNameAsync(string roleName);

        /// <summary>
        /// Creates and adds a new role to the database.
        /// </summary>
        Task AddAsync(Role role);

        /// <summary>
        /// Deletes a role from the database.
        /// </summary>
        Task DeleteAsync(Role role);
    }
}
