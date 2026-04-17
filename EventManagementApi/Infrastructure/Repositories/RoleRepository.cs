using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for Role entity data access operations.
    /// Handles all database operations on Role table using EF Core.
    /// Uses DbSet<Role> which maps to singular "Role" table in database.
    /// </summary>
    public class RoleRepository : IRoleRepository
    {
        private readonly AppDbContext _context;

        public RoleRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Retrieves all roles from the database.
        /// </summary>
        public async Task<List<Role>> GetAllAsync()
        {
            return await _context.Role.ToListAsync();
        }

        /// <summary>
        /// Retrieves a single role by ID.
        /// Returns null if role not found.
        /// </summary>
        public async Task<Role?> GetByIdAsync(int id)
        {
            return await _context.Role.FirstOrDefaultAsync(r => r.RoleId == id);
        }

        /// <summary>
        /// Retrieves a role by its name (case-insensitive comparison).
        /// Returns null if role not found.
        /// Used for checking duplicate role names during creation.
        /// </summary>
        public async Task<Role?> GetByNameAsync(string roleName)
        {
            return await _context.Role
                .FirstOrDefaultAsync(r => r.RoleName.ToLower() == roleName.ToLower());
        }

        /// <summary>
        /// Creates and adds a new role to the database.
        /// </summary>
        public async Task AddAsync(Role role)
        {
            await _context.Role.AddAsync(role);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Deletes a role from the database.
        /// Physically removes the role record.
        /// WARNING: Ensure no users are assigned to this role before deleting.
        /// </summary>
        public async Task DeleteAsync(Role role)
        {
            _context.Role.Remove(role);
            await _context.SaveChangesAsync();
        }
    }
}
