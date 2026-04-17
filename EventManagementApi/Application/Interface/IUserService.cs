using Application.DTOs;

namespace Application.Interfaces
{
    /// <summary>
    /// Service interface for user management operations.
    /// Handles business logic for user CRUD operations.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Retrieves all users from the system.
        /// </summary>
        Task<List<UserResponseDto>> GetAllUsersAsync();

        /// <summary>
        /// Retrieves a user by their email address.
        /// Throws exception if user not found.
        /// </summary>
        Task<UserResponseDto> GetUserByEmailAsync(string email);

        /// <summary>
        /// Retrieves a user by their ID.
        /// Throws exception if user not found.
        /// </summary>
        Task<UserResponseDto> GetUserByIdAsync(int id);

        /// <summary>
        /// Updates user information (FullName and/or Email).
        /// Only updates fields that are provided (non-null).
        /// Throws exception if user not found or email already exists.
        /// </summary>
        Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserDto dto);

        /// <summary>
        /// Deletes a user by ID.
        /// Returns true if successful, false if user not found.
        /// </summary>
        Task<bool> DeleteUserAsync(int id);
    }
}
