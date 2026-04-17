using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories
{
    /// <summary>
    /// Repository implementation for EventRegistration entity data access operations.
    /// Handles all database operations on EventRegistration table using EF Core.
    /// Uses DbSet<EventRegistration> which maps to singular "EventRegistration" table in database.
    /// </summary>
    public class EventRegistrationRepository : IEventRegistrationRepository
    {
        private readonly AppDbContext _context;

        public EventRegistrationRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates and adds a new event registration to the database.
        /// Sets RegisteredAt timestamp automatically.
        /// </summary>
        public async Task AddAsync(EventRegistration entity)
        {
            entity.RegisteredAt = DateTime.UtcNow; // Set registration timestamp
            await _context.EventRegistration.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Retrieves all event registrations from the database.
        /// Includes related Event and Attendee (User) information.
        /// </summary>
        public async Task<List<EventRegistration>> GetAllAsync()
        {
            return await _context.EventRegistration
                .Include(er => er.Event)
                .Include(er => er.Attendee)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a single event registration by ID.
        /// Includes related Event and Attendee information.
        /// Returns null if registration not found.
        /// </summary>
        public async Task<EventRegistration?> GetByIdAsync(int id)
        {
            return await _context.EventRegistration
                .Include(er => er.Event)
                .Include(er => er.Attendee)
                .FirstOrDefaultAsync(er => er.RegistrationId == id);
        }

        /// <summary>
        /// Retrieves an event registration by event ID and attendee ID.
        /// Used to check for duplicate registrations.
        /// Returns null if no registration found for this combination.
        /// </summary>
        public async Task<EventRegistration?> GetByEventAndUserAsync(int eventId, int attendeeId)
        {
            return await _context.EventRegistration
                .FirstOrDefaultAsync(er => er.EventId == eventId && er.AttendeeId == attendeeId);
        }

        /// <summary>
        /// Deletes an event registration from the database.
        /// Physically removes the registration record.
        /// </summary>
        public async Task DeleteAsync(EventRegistration entity)
        {
            _context.EventRegistration.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
