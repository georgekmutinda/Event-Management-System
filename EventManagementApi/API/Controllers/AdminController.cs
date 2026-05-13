using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementApi.Controllers
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ICacheService _cacheService;

        public AdminController(IAdminService adminService, ICacheService cacheService)
        {
            _adminService = adminService;
            _cacheService = cacheService;
        }

        [HttpGet("sessions")]
        public async Task<ActionResult<List<ActiveSessionDto>>> GetSessions()
        {
            return Ok(await _adminService.GetActiveSessionsAsync());
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<IActionResult> KickSession(string sessionId)
        {
            var removed = await _adminService.KickSessionAsync(sessionId);
            if (!removed)
            {
                return NotFound(new { message = "Session not found." });
            }

            return Ok(new { message = "Session terminated successfully." });
        }

        [HttpGet("messages")]
        public async Task<ActionResult<List<BroadcastMessageResponseDto>>> GetMessages()
        {
            return Ok(await _adminService.GetMessagesAsync());
        }

        [HttpPost("broadcast")]
        public async Task<ActionResult<BroadcastMessageResponseDto>> Broadcast([FromBody] BroadcastMessageRequestDto request)
        {
            var sentBy = User.FindFirstValue(ClaimTypes.Name) ?? "Admin";
            return Ok(await _adminService.BroadcastAsync(request, sentBy));
        }

        [HttpPost("register-vendor")]
        public async Task<ActionResult<AdminAccountResponseDto>> RegisterVendor([FromBody] AdminRegisterVendorDto request)
        {
            var response = await _adminService.RegisterVendorAsync(request);
            await _cacheService.RemoveAsync("vendors:all");
            return Ok(response);
        }

        [HttpPost("register-service-provider")]
        public async Task<ActionResult<AdminAccountResponseDto>> RegisterServiceProvider([FromBody] AdminRegisterServiceProviderDto request)
        {
            var response = await _adminService.RegisterServiceProviderAsync(request);
            await _cacheService.RemoveAsync("service-providers:all");
            return Ok(response);
        }
    }
}
