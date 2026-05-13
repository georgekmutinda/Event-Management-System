using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for User Management operations.
    /// Provides endpoints for retrieving, updating, and deleting users.
    /// </summary>
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ICacheService _cacheService;

        public UserController(IUserService userService, ICacheService cacheService)
        {
            _userService = userService;
            _cacheService = cacheService;
        }

        /// <summary>
        /// GET /api/users
        /// Retrieves all users from the system.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<UserResponseDto>>> GetAllUsers()
        {
            try
            {
                const string cacheKey = "users:all";
                
                var cachedUsers = await _cacheService.GetAsync<List<UserResponseDto>>(cacheKey);
                if (cachedUsers != null)
                    return Ok(cachedUsers);
                
                var users = await _userService.GetAllUsersAsync();
                
                await _cacheService.SetAsync(cacheKey, users, TimeSpan.FromMinutes(30));
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving users: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/users/email/{email}
        /// Retrieves a user by their email address.
        /// </summary>
        [HttpGet("email/{email}")]
        public async Task<ActionResult<UserResponseDto>> GetUserByEmail(string email)
        {
            try
            {
                var cacheKey = $"users:email:{email}";
                
                var cachedUser = await _cacheService.GetAsync<UserResponseDto>(cacheKey);
                if (cachedUser != null)
                    return Ok(cachedUser);
                
                var user = await _userService.GetUserByEmailAsync(email);
                
                await _cacheService.SetAsync(cacheKey, user, TimeSpan.FromHours(1));
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/users/{id}
        /// Retrieves a user by their ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponseDto>> GetUserById(int id)
        {
            try
            {
                var cacheKey = $"users:{id}";
                
                var cachedUser = await _cacheService.GetAsync<UserResponseDto>(cacheKey);
                if (cachedUser != null)
                    return Ok(cachedUser);
                
                var user = await _userService.GetUserByIdAsync(id);
                
                await _cacheService.SetAsync(cacheKey, user, TimeSpan.FromHours(1));
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/users/{id}
        /// Updates a user's full name and/or email.
        /// Only provided fields are updated.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            // Validate that at least one field is provided
            if (string.IsNullOrWhiteSpace(dto?.FullName) && string.IsNullOrWhiteSpace(dto?.Email))
            {
                return BadRequest(new { message = "At least one field (FullName or Email) must be provided" });
            }

            try
            {
                var updatedUser = await _userService.UpdateUserAsync(id, dto);
                
                // Invalidate cache
                await _cacheService.RemoveAsync($"users:{id}");
                await _cacheService.RemoveAsync("users:all");
                await _cacheService.RemoveByPatternAsync("users:email:*");
                
                return Ok(updatedUser);
            }
            catch (Exception ex)
            {
                return StatusCode(400, new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE /api/users/{id}
        /// Deletes a user by their ID.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            try
            {
                var deleted = await _userService.DeleteUserAsync(id);
                
                if (!deleted)
                    return NotFound(new { message = $"User with ID '{id}' not found" });

                // Invalidate cache
                await _cacheService.RemoveAsync($"users:{id}");
                await _cacheService.RemoveAsync("users:all");
                await _cacheService.RemoveByPatternAsync("users:email:*");

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting user: {ex.Message}" });
            }
        }
    }
}
