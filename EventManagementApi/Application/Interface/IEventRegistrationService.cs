using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for managing event registration operations.
    /// Provides abstraction for business logic related to event registrations.
    /// </summary>
    public interface IEventRegistrationService
    {
        /// <summary>
        /// Registers a user for an event.
        /// Validates that event and user exist.
        /// Prevents duplicate registrations (same event + attendee).
        /// </summary>
        Task<EventRegistrationResponseDto> RegisterAsync(EventRegistrationRequestDto dto);

        /// <summary>
        /// Retrieves all event registrations from the system.
        /// </summary>
        Task<List<EventRegistrationResponseDto>> GetAllAsync();

        /// <summary>
        /// Retrieves a single event registration by ID.
        /// Throws exception if registration not found.
        /// </summary>
        Task<EventRegistrationResponseDto> GetByIdAsync(int id);

        /// <summary>
        /// Deletes an event registration by ID.
        /// Returns true if successful, false if registration not found.
        /// </summary>
        Task<bool> DeleteAsync(int id);
    }
}
