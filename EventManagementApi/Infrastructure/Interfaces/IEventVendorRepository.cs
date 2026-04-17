using Domain.Entities;

namespace Infrastructure.Interfaces
{
    /// <summary>
    /// Repository interface for EventVendor entity data access operations.
    /// Provides abstraction for database operations on EventVendor table (many-to-many relationship).
    /// </summary>
    public interface IEventVendorRepository
    {
        /// <summary>
        /// Creates and adds a new event-vendor association to the database.
        /// </summary>
        Task AddAsync(EventVendor entity);

        /// <summary>
        /// Retrieves all event-vendor associations from the database.
        /// </summary>
        Task<List<EventVendor>> GetAllAsync();

        /// <summary>
        /// Retrieves a single event-vendor association by ID.
        /// Returns null if association not found.
        /// </summary>
        Task<EventVendor?> GetByIdAsync(int id);

        /// <summary>
        /// Retrieves an event-vendor association by event ID and vendor ID.
        /// Used to check for duplicate associations.
        /// Returns null if no association found for this combination.
        /// </summary>
        Task<EventVendor?> GetByEventAndVendorAsync(int eventId, int vendorId);

        /// <summary>
        /// Deletes an event-vendor association from the database.
        /// </summary>
        Task DeleteAsync(EventVendor entity);
    }
}
