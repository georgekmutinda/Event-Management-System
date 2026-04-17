using Domain.Entities;

namespace Infrastructure.Interfaces
{
    /// <summary>
    /// Repository interface for EventRegistration entity data access operations.
    /// Provides abstraction for database operations on EventRegistration table.
    /// </summary>
    public interface IEventRegistrationRepository
    {
        /// <summary>
        /// Creates and adds a new event registration to the database.
        /// </summary>
        Task AddAsync(EventRegistration entity);

        /// <summary>
        /// Retrieves all event registrations from the database.
        /// </summary>
        Task<List<EventRegistration>> GetAllAsync();

        /// <summary>
        /// Retrieves a single event registration by ID.
        /// Returns null if registration not found.
        /// </summary>
        Task<EventRegistration?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves an event registration by event ID and attendee ID.
        /// Used to check for duplicate registrations.
        /// Returns null if no registration found for this combination.
        /// </summary>
        Task<EventRegistration?> GetByEventAndUserAsync(int eventId, int attendeeId);

        /// <summary>
        /// Deletes an event registration from the database.
        /// </summary>
        Task DeleteAsync(EventRegistration entity);
    }
}
