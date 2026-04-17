using Domain.Entities;

namespace Infrastructure.Interfaces
{
    /// <summary>
    /// Repository interface for Vendor entity data access operations.
    /// Provides abstraction for database operations on Vendor table.
    /// </summary>
    public interface IVendorRepository
    {
        /// <summary>
        /// Creates and adds a new vendor to the database.
        /// </summary>
        Task AddAsync(Vendor entity);

        /// <summary>
        /// Retrieves all vendors from the database.
        /// </summary>
        Task<List<Vendor>> GetAllAsync();

        /// <summary>
        /// Retrieves a single vendor by ID.
        /// Returns null if vendor not found.
        /// </summary>
        Task<Vendor?> GetByIdAsync(int id);

        /// <summary>
        /// Updates an existing vendor in the database.
        /// </summary>
        Task UpdateAsync(Vendor entity);

        /// <summary>
        /// Deletes a vendor from the database.
        /// </summary>
        Task DeleteAsync(Vendor entity);
    }
}
