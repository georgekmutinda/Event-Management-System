using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for role management operations.
    /// Handles business logic for role CRUD operations.
    /// </summary>
    public interface IRoleService
    {
        /// <summary>
        /// Retrieves all roles from the system.
        /// </summary>
        Task<List<RoleResponseDto>> GetAllRolesAsync();

        /// <summary>
        /// Creates a new role with a unique name.
        /// Throws exception if role name already exists.
        /// </summary>
        Task<RoleResponseDto> CreateRoleAsync(RoleRequestDto dto);

        /// <summary>
        /// Deletes a role by ID.
        /// Returns true if successful, false if role not found.
        /// </summary>
        Task<bool> DeleteRoleAsync(int id);
    }
}
