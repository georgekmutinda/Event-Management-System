using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for EventVendor entity data access operations.
    /// Handles all database operations on EventVendor join table using EF Core.
    /// Uses DbSet<EventVendor> which maps to singular "EventVendor" table in database.
    /// Manages the many-to-many relationship between Event and Vendor.
    /// </summary>
    public class EventVendorRepository : IEventVendorRepository
    {
        private readonly AppDbContext _context;

        public EventVendorRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates and adds a new event-vendor association to the database.
        /// </summary>
        public async Task AddAsync(EventVendor entity)
        {
            await _context.EventVendor.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Retrieves all event-vendor associations from the database.
        /// Includes related Event and Vendor information.
        /// </summary>
        public async Task<List<EventVendor>> GetAllAsync()
        {
            return await _context.EventVendor
                .Include(ev => ev.Event)
                .Include(ev => ev.Vendor)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a single event-vendor association by ID.
        /// Includes related Event and Vendor information.
        /// Returns null if association not found.
        /// </summary>
        public async Task<EventVendor?> GetByIdAsync(int id)
        {
            return await _context.EventVendor
                .Include(ev => ev.Event)
                .Include(ev => ev.Vendor)
                .FirstOrDefaultAsync(ev => ev.EventVendorId == id);
        }

        /// <summary>
        /// Retrieves an event-vendor association by event ID and vendor ID.
        /// Used to check for duplicate associations.
        /// Returns null if no association found for this combination.
        /// </summary>
        public async Task<EventVendor?> GetByEventAndVendorAsync(int eventId, int vendorId)
        {
            return await _context.EventVendor
                .FirstOrDefaultAsync(ev => ev.EventId == eventId && ev.VendorId == vendorId);
        }

        /// <summary>
        /// Deletes an event-vendor association from the database.
        /// Physically removes the relationship record.
        /// </summary>
        public async Task DeleteAsync(EventVendor entity)
        {
            _context.EventVendor.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
