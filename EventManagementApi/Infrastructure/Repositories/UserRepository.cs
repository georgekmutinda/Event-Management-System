using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            // This will now look for table "user" instead of "User"
            return await _context.User
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task AddUserAsync(User user)
        {
            await _context.User.AddAsync(user);
            
            await _context.SaveChangesAsync();

Console.WriteLine("USER ID: " + user.UserId);
        }

        public async Task<Role?> GetRoleByNameAsync(string roleName)
        {
            return await _context.Role
                .FirstOrDefaultAsync(r => r.RoleName == roleName);
        }

        public async Task AddUserRoleAsync(UserRole userRole)
        {
            await _context.UserRole.AddAsync(userRole);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Role>> GetUserRolesAsync(int userId)
        {
            return await _context.UserRole
                .Where(ur => ur.UserId == userId)
                .Include(ur => ur.Role)
                .Select(ur => ur.Role)
                .ToListAsync();
        }

        // ========== NEW METHODS (User Management) ==========

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.User.ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.User.FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task UpdateAsync(User user)
        {
            _context.User.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.User.Remove(user);
            await _context.SaveChangesAsync();
        }
    }
}
