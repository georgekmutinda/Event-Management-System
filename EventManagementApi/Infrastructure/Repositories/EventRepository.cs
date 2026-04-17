using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for Event entity data access operations.
    /// Handles all database operations on Event table using EF Core.
    /// Uses DbSet<Event> which maps to singular "Event" table in database.
    /// </summary>
    public class EventRepository : IEventRepository
    {
        private readonly AppDbContext _context;

        public EventRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates and adds a new event to the database.
        /// Sets CreatedAt timestamp automatically.
        /// </summary>
        public async Task AddAsync(Event entity)
        {
            entity.CreatedAt = DateTime.UtcNow; // Set creation timestamp
            await _context.Event.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Retrieves all events from the database.
        /// Includes related Planner (User) information.
        /// </summary>
        public async Task<List<Event>> GetAllAsync()
        {
            return await _context.Event
                .Include(e => e.Planner)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a single event by ID.
        /// Includes related Planner information.
        /// Returns null if event not found.
        /// </summary>
        public async Task<Event?> GetByIdAsync(int id)
        {
            return await _context.Event
                .Include(e => e.Planner)
                .FirstOrDefaultAsync(e => e.EventId == id);
        }

        /// <summary>
        /// Updates an existing event in the database.
        /// Must fetch the event first, update it, then call this method.
        /// </summary>
        public async Task UpdateAsync(Event entity)
        {
            _context.Event.Update(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Deletes an event from the database.
        /// Physically removes the event record.
        /// </summary>
        public async Task DeleteAsync(Event entity)
        {
            _context.Event.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
