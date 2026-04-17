using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for managing event-vendor associations.
    /// Provides abstraction for business logic related to event-vendor relationships.
    /// </summary>
    public interface IEventVendorService
    {
        /// <summary>
        /// Links a vendor to an event.
        /// Validates that event and vendor exist.
        /// Prevents duplicate associations (same event + vendor).
        /// </summary>
        Task<EventVendorResponseDto> CreateAsync(EventVendorRequestDto dto);

        /// <summary>
        /// Retrieves all event-vendor associations from the system.
        /// </summary>
        Task<List<EventVendorResponseDto>> GetAllAsync();

        /// <summary>
        /// Deletes an event-vendor association by ID.
        /// Returns true if successful, false if association not found.
        /// </summary>
        Task<bool> DeleteAsync(int id);
    }
}

