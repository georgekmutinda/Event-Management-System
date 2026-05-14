using Application.DTOs;
using Application.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Payment operations.
    /// Endpoints:
    ///   POST   /api/payments          — create a payment record
    ///   GET    /api/payments          — list all payments
    ///   GET    /api/payments/{id}     — get payment by ID
    ///   POST   /api/payments/redeem   — redeem a pre-paid payment code
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _service;
        private readonly ICacheService   _cacheService;

        public PaymentController(IPaymentService service, ICacheService cacheService)
        {
            _service      = service;
            _cacheService = cacheService;
        }

        /// <summary>
        /// POST /api/payments
        /// Creates a new payment record.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] CreatePaymentDto dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Request body is required" });

            try
            {
                var created = await _service.CreateAsync(dto);
                await _cacheService.RemoveAsync("payments:all");
                return CreatedAtAction(nameof(GetPaymentById), new { id = created.PaymentId }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/payments
        /// Retrieves all payments from the system.
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<ActionResult<List<PaymentResponseDto>>> GetAllPayments()
        {
            try
            {
                const string cacheKey = "payments:all";
                var cached = await _cacheService.GetAsync<List<PaymentResponseDto>>(cacheKey);
                if (cached != null) return Ok(cached);

                var payments = await _service.GetAllAsync();
                await _cacheService.SetAsync(cacheKey, payments, TimeSpan.FromMinutes(20));
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Error retrieving payments: {ex.Message}" });
            }
        }

        [HttpGet("mine")]
        public async Task<ActionResult<List<PaymentResponseDto>>> GetMyPayments()
        {
            var userIdClaim = User.FindFirstValue("userId");
            if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
                return Unauthorized(new { message = "Unable to determine the current user." });

            var payments = await _service.GetAllAsync();
            return Ok(payments.Where(item => item.UserId == userId).ToList());
        }

        /// <summary>
        /// GET /api/payments/{id}
        /// Retrieves a single payment by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentResponseDto>> GetPaymentById(int id)
        {
            try
            {
                var cacheKey = $"payments:{id}";
                var cached = await _cacheService.GetAsync<PaymentResponseDto>(cacheKey);
                if (cached != null) return Ok(cached);

                var payment = await _service.GetByIdAsync(id);
                await _cacheService.SetAsync(cacheKey, payment, TimeSpan.FromHours(1));
                return Ok(payment);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/payments/redeem
        /// Verifies and redeems a pre-paid payment code.
        /// A code can only be used once; subsequent attempts return 409 Conflict.
        /// </summary>
        [HttpPost("redeem")]
        public async Task<ActionResult<PaymentCodeRedemptionResponseDto>> RedeemCode(
            [FromBody] PaymentCodeRedemptionDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Code))
                return BadRequest(new { message = "Payment code is required." });

            try
            {
                // Normalise: strip whitespace, uppercase
                dto.Code = dto.Code.Trim().ToUpperInvariant();

                var userIdClaim = User.FindFirstValue("userId");
                if (!int.TryParse(userIdClaim, out var userId) || userId <= 0)
                    return Unauthorized(new { message = "Unable to determine the current user." });

                var result = await _service.RedeemCodeAsync(dto.Code, userId, dto.EventId);

                // Invalidate payments cache so the redemption appears in lists
                await _cacheService.RemoveAsync("payments:all");

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                // Code already used or not found
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
