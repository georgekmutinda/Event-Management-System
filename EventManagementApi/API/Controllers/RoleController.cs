using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Role Management operations.
    /// Provides endpoints for retrieving, creating, and deleting roles.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/roles")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly ICacheService _cacheService;

        public RoleController(IRoleService roleService, ICacheService cacheService)
        {
            _roleService = roleService;
            _cacheService = cacheService;
        }

        /// <summary>
        /// GET /api/roles
        /// Retrieves all roles available in the system.
        /// Returns empty list if no roles exist.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<RoleResponseDto>>> GetAllRoles()
        {
            try
            {
                const string cacheKey = "roles:all";
                var cachedRoles = await _cacheService.GetAsync<List<RoleResponseDto>>(cacheKey);
                if (cachedRoles != null)
                    return Ok(cachedRoles);
                
                var roles = await _roleService.GetAllRolesAsync();
                await _cacheService.SetAsync(cacheKey, roles, TimeSpan.FromMinutes(60));
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving roles: {ex.Message}" });
            }
        }

        /// <summary>
        /// POST /api/roles
        /// Creates a new role with a unique name.
        /// Returns 201 Created with the new role details.
        /// Returns 400 Bad Request if role name already exists or validation fails.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<RoleResponseDto>> CreateRole([FromBody] RoleRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            try
            {
                var createdRole = await _roleService.CreateRoleAsync(dto);
                await _cacheService.RemoveAsync("roles:all");
                return CreatedAtAction(nameof(GetAllRoles), new { id = createdRole.RoleId }, createdRole);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE /api/roles/{id}
        /// Deletes a role by ID.
        /// Returns 200 OK if successful, 404 if role not found.
        /// WARNING: May fail if users are assigned to this role (database constraint).
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRole(int id)
        {
            try
            {
                var success = await _roleService.DeleteRoleAsync(id);
                
                if (!success)
                    return NotFound(new { message = $"Role with ID '{id}' not found" });

                await _cacheService.RemoveAsync("roles:all");
                return Ok(new { message = $"Role with ID '{id}' deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting role: {ex.Message}" });
            }
        }
    }
}
