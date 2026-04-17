using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Event Service operations.
    /// Provides endpoints for creating, retrieving, and deleting event services.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/event-services")]
    public class EventServiceController : ControllerBase
{
    private readonly IEventServiceService _service;
    private readonly ICacheService _cacheService;

    public EventServiceController(IEventServiceService service, ICacheService cacheService)
    {
        _service = service;
        _cacheService = cacheService;
    }

    /// <summary>
    /// POST /api/event-services
    /// Creates a new event service linking a service provider to an event.
    /// Validates that both event and service provider exist.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EventServiceResponseDto>> CreateEventService([FromBody] CreateEventServiceDto dto)
    {
        // Validate input
        if (dto == null)
            return BadRequest(new { message = "Request body is required" });

        try
        {
            var created = await _service.CreateAsync(dto);
            await _cacheService.RemoveAsync("event-services:all");
            return CreatedAtAction(nameof(GetAllEventServices), created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/event-services
    /// Retrieves all event services from the system.
    /// Returns empty list if no event services exist.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<EventServiceResponseDto>>> GetAllEventServices()
    {
        try
        {
            const string cacheKey = "event-services:all";
            var cachedEventServices = await _cacheService.GetAsync<List<EventServiceResponseDto>>(cacheKey);
            if (cachedEventServices != null)
                return Ok(cachedEventServices);
            
            var eventServices = await _service.GetAllAsync();
            await _cacheService.SetAsync(cacheKey, eventServices, TimeSpan.FromMinutes(20));
            return Ok(eventServices);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error retrieving event services: {ex.Message}" });
        }
    }

    /// <summary>
    /// DELETE /api/event-services/{id}
    /// Deletes an event service by ID.
    /// Returns 204 No Content on success.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<StatusCodeResult> DeleteEventService(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            await _cacheService.RemoveAsync("event-services:all");
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest();
        }
    }
    }
}
