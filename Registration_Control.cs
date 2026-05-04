using Microsoft.AspNetCore.Mvc;
using EventSecurityAPI.Data;
using EventSecurityAPI.Models;

namespace EventSecurityAPI.Controllers;


[ApiController]
[Route("api/registrations")]

public class RegistrationController :
ControllerBase
{
    private readonly AppDbContext _context;

    public RegistrationController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost] public IActionResult Register([FromBody] RegisterRequest request)
    {
        var registeration = new EventRegistration
        {
            EventId = request.EventId,
            AttendeeId = request.AttendeeId,
            TicketType = request.TicketType,
            PaymentStatus = "Pending",
            RegisteredAt = DateTime.Now
        };

        _context.EventRegistrations.Add(registeration);
        _context.SaveChanges();

        return Ok(new { Message = "Registration Successful!", registeration });
    }
}