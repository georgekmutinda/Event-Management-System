using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace EventManagementApi.Controllers
{
    /// <summary>
    /// API Controller for Payment operations.
    /// Provides endpoints for creating, retrieving payments.
    /// All endpoints return DTOs (never entities) and handle errors appropriately.
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
{
    private readonly IPaymentService _service;
    private readonly ICacheService _cacheService;

    public PaymentController(IPaymentService service, ICacheService cacheService)
    {
        _service = service;
        _cacheService = cacheService;
    }

    /// <summary>
    /// POST /api/payments
    /// Creates a new payment record.
    /// Validates that both user and event exist.
    /// Sets default payment status to "Pending" and payment date to UTC now.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] CreatePaymentDto dto)
    {
        // Validate input
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
    /// Returns empty list if no payments exist.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<List<PaymentResponseDto>>> GetAllPayments()
    {
        try
        {
            const string cacheKey = "payments:all";
            var cachedPayments = await _cacheService.GetAsync<List<PaymentResponseDto>>(cacheKey);
            if (cachedPayments != null)
                return Ok(cachedPayments);
            
            var payments = await _service.GetAllAsync();
            await _cacheService.SetAsync(cacheKey, payments, TimeSpan.FromMinutes(20));
            return Ok(payments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error retrieving payments: {ex.Message}" });
        }
    }

    /// <summary>
    /// GET /api/payments/{id}
    /// Retrieves a single payment by ID.
    /// Returns 404 if payment not found.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<PaymentResponseDto>> GetPaymentById(int id)
    {
        try
        {
            var cacheKey = $"payments:{id}";
            var cachedPayment = await _cacheService.GetAsync<PaymentResponseDto>(cacheKey);
            if (cachedPayment != null)
                return Ok(cachedPayment);
            
            var payment = await _service.GetByIdAsync(id);
            await _cacheService.SetAsync(cacheKey, payment, TimeSpan.FromHours(1));
            return Ok(payment);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
    }
}
