using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventManagementApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/invitations")]
    public class InvitationController : ControllerBase
    {
        private readonly IInvitationService _invitationService;
        private readonly ICacheService _cacheService;

        public InvitationController(IInvitationService invitationService, ICacheService cacheService)
        {
            _invitationService = invitationService;
            _cacheService = cacheService;
        }

        [HttpPost]
        public async Task<ActionResult<InvitationResponseDto>> CreateInvitation([FromBody] CreateInvitationDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            try
            {
                var created = await _invitationService.CreateAsync(dto);
                await _cacheService.RemoveAsync("invitations:all");
                return CreatedAtAction(nameof(GetInvitationById), new { id = created.InvitationId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<List<InvitationResponseDto>>> GetAllInvitations()
        {
            try
            {
                const string cacheKey = "invitations:all";
                var cachedInvitations = await _cacheService.GetAsync<List<InvitationResponseDto>>(cacheKey);
                if (cachedInvitations != null)
                    return Ok(cachedInvitations);

                var invitations = await _invitationService.GetAllAsync();
                await _cacheService.SetAsync(cacheKey, invitations, TimeSpan.FromMinutes(20));
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving invitations: {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InvitationResponseDto>> GetInvitationById(int id)
        {
            try
            {
                var cacheKey = $"invitations:{id}";
                var cachedInvitation = await _cacheService.GetAsync<InvitationResponseDto>(cacheKey);
                if (cachedInvitation != null)
                    return Ok(cachedInvitation);

                var invitation = await _invitationService.GetByIdAsync(id);
                await _cacheService.SetAsync(cacheKey, invitation, TimeSpan.FromHours(1));
                return Ok(invitation);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}
