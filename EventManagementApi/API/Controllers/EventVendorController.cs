using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;using Microsoft.AspNetCore.Authorization;
namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Event-Vendor Association Management operations.
    /// Provides endpoints for linking vendors to events and managing those relationships.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/event-vendors")]
    public class EventVendorController : ControllerBase
    {
        private readonly IEventVendorService _eventVendorService;
        private readonly ICacheService _cacheService;

        public EventVendorController(IEventVendorService eventVendorService, ICacheService cacheService)
        {
            _eventVendorService = eventVendorService;
            _cacheService = cacheService;
        }

        /// <summary>
        /// POST /api/event-vendors
        /// Links a vendor to an event.
        /// Validates that both event and vendor exist.
        /// Prevents duplicate associations.
        /// </summary>
        [Authorize(Roles = "Planner,Admin")]
        [HttpPost]
        public async Task<ActionResult<EventVendorResponseDto>> LinkVendorToEvent([FromBody] EventVendorRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            if (dto.EventId <= 0 || dto.VendorId <= 0)
                return BadRequest(new { message = "Valid EventId and VendorId are required" });

            try
            {
                var eventVendor = await _eventVendorService.CreateAsync(dto);
                await _cacheService.RemoveAsync("event-vendors:all");
                return CreatedAtAction(nameof(GetAllEventVendors), new { }, eventVendor);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/event-vendors
        /// Retrieves all event-vendor associations from the system.
        /// Returns empty list if no associations exist.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<EventVendorResponseDto>>> GetAllEventVendors()
        {
            try
            {
                const string cacheKey = "event-vendors:all";
                var cachedEventVendors = await _cacheService.GetAsync<List<EventVendorResponseDto>>(cacheKey);
                if (cachedEventVendors != null)
                    return Ok(cachedEventVendors);
                
                var eventVendors = await _eventVendorService.GetAllAsync();
                await _cacheService.SetAsync(cacheKey, eventVendors, TimeSpan.FromMinutes(20));
                return Ok(eventVendors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving event-vendor associations: {ex.Message}" });
            }
        }

        /// <summary>
        /// DELETE /api/event-vendors/{id}
        /// Deletes an event-vendor association by ID.
        /// Returns 200 OK if successful, 404 if association not found.
        /// </summary>
        [Authorize(Roles = "Planner,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventVendor(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Valid event-vendor ID is required" });

            try
            {
                var success = await _eventVendorService.DeleteAsync(id);
                
                if (!success)
                    return NotFound(new { message = $"Event-vendor association with ID '{id}' not found" });

                await _cacheService.RemoveAsync("event-vendors:all");
                return Ok(new { message = $"Event-vendor association with ID '{id}' deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting event-vendor association: {ex.Message}" });
            }
        }
    }
}
