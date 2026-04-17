using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for managing vendor operations.
    /// Provides abstraction for business logic related to vendors.
    /// </summary>
    public interface IVendorService
    {
        /// <summary>
        /// Creates a new vendor.
        /// Validates that the associated user exists.
        /// </summary>
        Task<VendorResponseDto> CreateAsync(VendorRequestDto dto);

        /// <summary>
        /// Retrieves all vendors from the system.
        /// </summary>
        Task<List<VendorResponseDto>> GetAllAsync();

        /// <summary>
        /// Retrieves a single vendor by ID.
        /// Throws exception if vendor not found.
        /// </summary>
        Task<VendorResponseDto> GetByIdAsync(int id);

        /// <summary>
        /// Updates an existing vendor.
        /// Only updates fields that are provided (non-null).
        /// Validates that user exists if UserId is being updated.
        /// </summary>
        Task<VendorResponseDto> UpdateAsync(int id, VendorRequestDto dto);

        /// <summary>
        /// Deletes a vendor by ID.
        /// Returns true if successful, false if vendor not found.
        /// </summary>
        Task<bool> DeleteAsync(int id);
    }
}
