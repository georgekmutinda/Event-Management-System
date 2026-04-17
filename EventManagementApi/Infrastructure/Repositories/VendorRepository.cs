using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for Vendor entity data access operations.
    /// Handles all database operations on Vendor table using EF Core.
    /// Uses DbSet<Vendor> which maps to singular "Vendor" table in database.
    /// </summary>
    public class VendorRepository : IVendorRepository
    {
        private readonly AppDbContext _context;

        public VendorRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates and adds a new vendor to the database.
        /// </summary>
        public async Task AddAsync(Vendor entity)
        {
            await _context.Vendor.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Retrieves all vendors from the database.
        /// Includes related User information.
        /// </summary>
        public async Task<List<Vendor>> GetAllAsync()
        {
            return await _context.Vendor
                .Include(v => v.User)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a single vendor by ID.
        /// Includes related User information.
        /// Returns null if vendor not found.
        /// </summary>
        public async Task<Vendor?> GetByIdAsync(int id)
        {
            return await _context.Vendor
                .Include(v => v.User)
                .FirstOrDefaultAsync(v => v.VendorId == id);
        }

        /// <summary>
        /// Updates an existing vendor in the database.
        /// Must fetch the vendor first, update it, then call this method.
        /// </summary>
        public async Task UpdateAsync(Vendor entity)
        {
            _context.Vendor.Update(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Deletes a vendor from the database.
        /// Physically removes the vendor record.
        /// </summary>
        public async Task DeleteAsync(Vendor entity)
        {
            _context.Vendor.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
