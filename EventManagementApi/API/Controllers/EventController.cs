using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Event Management operations.
    /// Provides endpoints for creating, retrieving, updating, and deleting events.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/events")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly ICacheService _cacheService;

        public EventController(IEventService eventService, ICacheService cacheService)
        {
            _eventService = eventService;
            _cacheService = cacheService;
        }

        /// <summary>
        /// POST /api/events
        /// Creates a new event with the provided details.
        /// Validates that the planner (user) exists.
        /// </summary>
        [Authorize(Roles = "Planner,Admin")]
        [HttpPost]
        public async Task<ActionResult<EventResponseDto>> CreateEvent([FromBody] EventRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            try
            {
                if (User.IsInRole("Planner"))
                {
                    var currentUserId = GetCurrentUserId();
                    if (currentUserId <= 0)
                        return Unauthorized(new { message = "Planner account could not be resolved. Please sign in again." });

                    dto.PlannerId = currentUserId;
                }

                var createdEvent = await _eventService.CreateEventAsync(dto);
                
                // Invalidate the events list cache
                await _cacheService.RemoveAsync("events:all");
                
                return CreatedAtAction(nameof(GetEventById), new { id = createdEvent.EventId }, createdEvent);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var value = User.FindFirstValue("userId");
            return int.TryParse(value, out var userId) ? userId : 0;
        }

        /// <summary>
        /// GET /api/events
        /// Retrieves all events from the system.
        /// Returns empty list if no events exist.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<EventResponseDto>>> GetAllEvents()
        {
            try
            {
                const string cacheKey = "events:all";
                
                // Try to get from cache first
                var cachedEvents = await _cacheService.GetAsync<List<EventResponseDto>>(cacheKey);
                if (cachedEvents != null)
                    return Ok(cachedEvents);
                
                // If not in cache, get from database
                var events = await _eventService.GetAllEventsAsync();
                
                // Cache the result for 30 minutes
                await _cacheService.SetAsync(cacheKey, events, TimeSpan.FromMinutes(30));
                
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving events: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/events/{id}
        /// Retrieves a single event by ID.
        /// Returns 404 if event not found.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<EventResponseDto>> GetEventById(int id)
        {
            try
            {
                var cacheKey = $"events:{id}";
                
                // Try to get from cache first
                var cachedEvent = await _cacheService.GetAsync<EventResponseDto>(cacheKey);
                if (cachedEvent != null)
                    return Ok(cachedEvent);
                
                // If not in cache, get from database
                var eventEntity = await _eventService.GetEventByIdAsync(id);
                
                // Cache the result for 1 hour
                await _cacheService.SetAsync(cacheKey, eventEntity, TimeSpan.FromHours(1));
                
                return Ok(eventEntity);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/events/{id}
        /// Updates an existing event.
        /// Only provided fields are updated; others remain unchanged.
        /// Validates that the planner exists if PlannerId is being changed.
        /// </summary>
        [Authorize(Roles = "Planner,Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<EventResponseDto>> UpdateEvent(int id, [FromBody] EventRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            try
            {
                var updatedEvent = await _eventService.UpdateEventAsync(id, dto);
                
                // Invalidate cache for this event and the all events list
                await _cacheService.RemoveAsync($"events:{id}");
                await _cacheService.RemoveAsync("events:all");
                
                return Ok(updatedEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(400, new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE /api/events/{id}
        /// Deletes an event by ID.
        /// Returns 200 OK if successful, 404 if event not found.
        /// </summary>
        [Authorize(Roles = "Planner,Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(int id)
        {
            try
            {
                var success = await _eventService.DeleteEventAsync(id);
                
                if (!success)
                    return NotFound(new { message = $"Event with ID '{id}' not found" });

                // Invalidate cache for this event and the all events list
                await _cacheService.RemoveAsync($"events:{id}");
                await _cacheService.RemoveAsync("events:all");

                return Ok(new { message = $"Event with ID '{id}' deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting event: {ex.Message}" });
            }
        }
    }
}
