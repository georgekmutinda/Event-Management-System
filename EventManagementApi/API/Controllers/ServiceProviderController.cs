using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Service Provider operations.
    /// Provides endpoints for creating, retrieving, updating, and deleting service providers.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/service-providers")]
    public class ServiceProviderController : ControllerBase
{
    private readonly IServiceProviderService _service;
    private readonly ICacheService _cacheService;

    public ServiceProviderController(IServiceProviderService service, ICacheService cacheService)
    {
        _service = service;
        _cacheService = cacheService;
    }

    /// <summary>
    /// POST /api/service-providers
    /// Creates a new service provider with the provided details.
    /// Validates that the associated user exists.
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ServiceProviderResponseDto>> CreateServiceProvider([FromBody] CreateServiceProviderDto dto)
    {
        // Validate input
        if (dto == null)
            return BadRequest(new { message = "Request body is required" });

        try
        {
            var created = await _service.CreateAsync(dto);
            await _cacheService.RemoveAsync("service-providers:all");
            return CreatedAtAction(nameof(GetServiceProviderById), new { id = created.ProviderId }, created);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// GET /api/service-providers
    /// Retrieves all service providers from the system.
    /// Returns empty list if no providers exist.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<ServiceProviderResponseDto>>> GetAllServiceProviders()
    {
        try
        {
            const string cacheKey = "service-providers:all";
            var cachedProviders = await _cacheService.GetAsync<List<ServiceProviderResponseDto>>(cacheKey);
            if (cachedProviders != null)
                return Ok(cachedProviders);
            
            var providers = await _service.GetAllAsync();
            await _cacheService.SetAsync(cacheKey, providers, TimeSpan.FromMinutes(30));
            return Ok(providers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error retrieving service providers: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/service-providers/{id}
    /// Retrieves a single service provider by ID.
    /// Returns 404 if provider not found.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceProviderResponseDto>> GetServiceProviderById(int id)
    {
        try
        {
            var cacheKey = $"service-providers:{id}";
            var cachedProvider = await _cacheService.GetAsync<ServiceProviderResponseDto>(cacheKey);
            if (cachedProvider != null)
                return Ok(cachedProvider);
            
            var provider = await _service.GetByIdAsync(id);
            await _cacheService.SetAsync(cacheKey, provider, TimeSpan.FromHours(1));
            return Ok(provider);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>
    /// PUT /api/service-providers/{id}
    /// Updates an existing service provider.
    /// Only updates fields that are provided (supports partial updates).
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceProviderResponseDto>> UpdateServiceProvider(int id, [FromBody] UpdateServiceProviderDto dto)
    {
        // Validate input
        if (dto == null)
            return BadRequest(new { message = "Request body is required" });

        try
        {
            var updated = await _service.UpdateAsync(id, dto);
            await _cacheService.RemoveAsync($"service-providers:{id}");
            await _cacheService.RemoveAsync("service-providers:all");
            return Ok(updated);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// DELETE /api/service-providers/{id}
    /// Deletes a service provider by ID.
    /// Returns 204 No Content on success.
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<StatusCodeResult> DeleteServiceProvider(int id)
    {
        try
        {
            await _service.DeleteAsync(id);
            await _cacheService.RemoveAsync($"service-providers:{id}");
            await _cacheService.RemoveAsync("service-providers:all");
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest();
        }
    }
    }
}
