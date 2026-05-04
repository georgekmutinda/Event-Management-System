using Microsoft.AspNetCore.Mvc;
using EventSecurityAPI.Data;
using EventSecurityAPI.Models;

namespace EventSecurityAPI.Controllers;


[ApiController]
[Route("api/payments")]
public class PaymentController : ControllerBase
{
    private readonly AppDbContext _context;
     public PaymentController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost] public IActionResult MakePayment([FromBody] PaymentRequest request)
    {
        var payment = new Payment
        {
            UserId = request.UserId,
            EventId = request.EventId,
            Amount = request.Amount,
            PaymentStatus = "Completed", 
            PaymentDate = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        _context.SaveChanges();

        return Ok(new { Message = "Payment Successful!", payment });
    }
}
