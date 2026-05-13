using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Event Registration Management operations.
    /// Provides endpoints for registering users to events and managing registrations.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/event-registrations")]
    public class EventRegistrationController : ControllerBase
    {
        private readonly IEventRegistrationService _eventRegistrationService;
        private readonly ICacheService _cacheService;

        public EventRegistrationController(IEventRegistrationService eventRegistrationService, ICacheService cacheService)
        {
            _eventRegistrationService = eventRegistrationService;
            _cacheService = cacheService;
        }

        /// <summary>
        /// POST /api/event-registrations
        /// Registers a user for an event.
        /// Validates that both event and user exist.
        /// Prevents duplicate registrations.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<EventRegistrationResponseDto>> RegisterForEvent([FromBody] EventRegistrationRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            if (dto.EventId <= 0 || dto.AttendeeId <= 0)
                return BadRequest(new { message = "Valid EventId and AttendeeId are required" });

            try
            {
                var registration = await _eventRegistrationService.RegisterAsync(dto);
                await _cacheService.RemoveAsync("registrations:all");
                return CreatedAtAction(nameof(GetRegistrationById), new { id = registration.RegistrationId }, registration);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/event-registrations
        /// Retrieves all event registrations from the system.
        /// Returns empty list if no registrations exist.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<EventRegistrationResponseDto>>> GetAllRegistrations()
        {
            try
            {
                const string cacheKey = "registrations:all";
                var cachedRegistrations = await _cacheService.GetAsync<List<EventRegistrationResponseDto>>(cacheKey);
                if (cachedRegistrations != null)
                    return Ok(cachedRegistrations);
                
                var registrations = await _eventRegistrationService.GetAllAsync();
                await _cacheService.SetAsync(cacheKey, registrations, TimeSpan.FromMinutes(20));
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving registrations: {ex.Message}" });
            }
        }

        [HttpGet("mine")]
        public async Task<ActionResult<List<EventRegistrationResponseDto>>> GetMyRegistrations()
        {
            var userIdClaim = User.FindFirstValue("userId");
            if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
                return Unauthorized(new { message = "Unable to determine the current user." });

            var registrations = await _eventRegistrationService.GetAllAsync();
            return Ok(registrations.Where(item => item.AttendeeId == userId).ToList());
        }

        /// <summary>
        /// GET /api/event-registrations/{id}
        /// Retrieves a single event registration by ID.
        /// Returns 404 if registration not found.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EventRegistrationResponseDto>> GetRegistrationById(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Valid registration ID is required" });

            try
            {
                var cacheKey = $"registrations:{id}";
                var cachedRegistration = await _cacheService.GetAsync<EventRegistrationResponseDto>(cacheKey);
                if (cachedRegistration != null)
                    return Ok(cachedRegistration);
                
                var registration = await _eventRegistrationService.GetByIdAsync(id);
                await _cacheService.SetAsync(cacheKey, registration, TimeSpan.FromHours(1));
                return Ok(registration);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE /api/event-registrations/{id}
        /// Deletes an event registration by ID.
        /// Returns 200 OK if successful, 404 if registration not found.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRegistration(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Valid registration ID is required" });

            try
            {
                var success = await _eventRegistrationService.DeleteAsync(id);
                
                if (!success)
                    return NotFound(new { message = $"Event registration with ID '{id}' not found" });

                await _cacheService.RemoveAsync($"registrations:{id}");
                await _cacheService.RemoveAsync("registrations:all");
                return Ok(new { message = $"Event registration with ID '{id}' deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting registration: {ex.Message}" });
            }
        }
    }
}
