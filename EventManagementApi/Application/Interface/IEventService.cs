using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for event management operations.
    /// Handles business logic for event CRUD operations.
    /// </summary>
    public interface IEventService
    {
        /// <summary>
        /// Creates a new event.
        /// Validates that the planner (user) exists before creating.
        /// </summary>
        Task<EventResponseDto> CreateEventAsync(EventRequestDto dto);

        /// <summary>
        /// Retrieves all events from the system.
        /// </summary>
        Task<List<EventResponseDto>> GetAllEventsAsync();

        /// <summary>
        /// Retrieves a single event by ID.
        /// Throws exception if event not found.
        /// </summary>
        Task<EventResponseDto> GetEventByIdAsync(int id);

        /// <summary>
        /// Updates an existing event.
        /// Only updates fields that are provided (non-null).
        /// Validates that planner exists if PlannerId is being updated.
        /// </summary>
        Task<EventResponseDto> UpdateEventAsync(int id, EventRequestDto dto);

        /// <summary>
        /// Deletes an event by ID.
        /// Returns true if successful, false if event not found.
        /// </summary>
        Task<bool> DeleteEventAsync(int id);
    }
}
