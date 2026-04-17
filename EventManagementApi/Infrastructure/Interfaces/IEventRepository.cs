using Domain.Entities;

namespace Infrastructure.Interfaces
{
    /// <summary>
    /// Repository interface for Event entity data access operations.
    /// Provides abstraction for database operations on Event table.
    /// </summary>
    public interface IEventRepository
    {
        /// <summary>
        /// Creates and adds a new event to the database.
        /// </summary>
        Task AddAsync(Event entity);

        /// <summary>
        /// Retrieves all events from the database.
        /// </summary>
        Task<List<Event>> GetAllAsync();

        /// <summary>
        /// Retrieves a single event by ID.
        /// Returns null if event not found.
        /// </summary>
        Task<Event?> GetByIdAsync(int id);

        /// <summary>
        /// Updates an existing event in the database.
        /// </summary>
        Task UpdateAsync(Event entity);

        /// <summary>
        /// Deletes an event from the database.
        /// </summary>
        Task DeleteAsync(Event entity);
    }
}
