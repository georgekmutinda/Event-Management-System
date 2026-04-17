using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Vendor Management operations.
    /// Provides endpoints for creating, retrieving, updating, and deleting vendors.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/vendors")]
    public class VendorController : ControllerBase
    {
        private readonly IVendorService _vendorService;
        private readonly ICacheService _cacheService;

        public VendorController(IVendorService vendorService, ICacheService cacheService)
        {
            _vendorService = vendorService;
            _cacheService = cacheService;
        }

        /// <summary>
        /// POST /api/vendors
        /// Creates a new vendor with the provided details.
        /// Validates that the associated user exists.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<VendorResponseDto>> CreateVendor([FromBody] VendorRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            if (dto.UserId <= 0)
                return BadRequest(new { message = "Valid UserId is required" });

            try
            {
                var createdVendor = await _vendorService.CreateAsync(dto);
                await _cacheService.RemoveAsync("vendors:all");
                return CreatedAtAction(nameof(GetVendorById), new { id = createdVendor.VendorId }, createdVendor);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/vendors
        /// Retrieves all vendors from the system.
        /// Returns empty list if no vendors exist.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<VendorResponseDto>>> GetAllVendors()
        {
            try
            {
                const string cacheKey = "vendors:all";
                var cachedVendors = await _cacheService.GetAsync<List<VendorResponseDto>>(cacheKey);
                if (cachedVendors != null)
                    return Ok(cachedVendors);
                
                var vendors = await _vendorService.GetAllAsync();
                await _cacheService.SetAsync(cacheKey, vendors, TimeSpan.FromMinutes(30));
                return Ok(vendors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving vendors: {ex.Message}" });
            }
        }

        /// <summary>
        /// GET /api/vendors/{id}
        /// Retrieves a single vendor by ID.
        /// Returns 404 if vendor not found.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<VendorResponseDto>> GetVendorById(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Valid vendor ID is required" });

            try
            {
                var cacheKey = $"vendors:{id}";
                var cachedVendor = await _cacheService.GetAsync<VendorResponseDto>(cacheKey);
                if (cachedVendor != null)
                    return Ok(cachedVendor);
                
                var vendor = await _vendorService.GetByIdAsync(id);
                await _cacheService.SetAsync(cacheKey, vendor, TimeSpan.FromHours(1));
                return Ok(vendor);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// PUT /api/vendors/{id}
        /// Updates an existing vendor.
        /// Only provided fields are updated; others remain unchanged.
        /// Validates that the associated user exists if UserId is being changed.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<VendorResponseDto>> UpdateVendor(int id, [FromBody] VendorRequestDto dto)
        {
            // Validate input
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            if (id <= 0)
                return BadRequest(new { message = "Valid vendor ID is required" });

            if (dto.UserId <= 0)
                return BadRequest(new { message = "Valid UserId is required" });

            try
            {
                var updatedVendor = await _vendorService.UpdateAsync(id, dto);
                await _cacheService.RemoveAsync($"vendors:{id}");
                await _cacheService.RemoveAsync("vendors:all");
                return Ok(updatedVendor);
            }
            catch (Exception ex)
            {
                return StatusCode(400, new { message = ex.Message });
            }
        }

        /// <summary>
        /// DELETE /api/vendors/{id}
        /// Deletes a vendor by ID.
        /// Returns 200 OK if successful, 404 if vendor not found.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVendor(int id)
        {
            if (id <= 0)
                return BadRequest(new { message = "Valid vendor ID is required" });

            try
            {
                var success = await _vendorService.DeleteAsync(id);
                
                if (!success)
                    return NotFound(new { message = $"Vendor with ID '{id}' not found" });

                await _cacheService.RemoveAsync($"vendors:{id}");
                await _cacheService.RemoveAsync("vendors:all");
                return Ok(new { message = $"Vendor with ID '{id}' deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error deleting vendor: {ex.Message}" });
            }
        }
    }
}
