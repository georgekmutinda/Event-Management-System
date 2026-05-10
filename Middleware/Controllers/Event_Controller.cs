using Microsoft.AspNetCore.Mvc;
using EventSecurityAPI.Data;
using EventSecurityAPI.Models;

namespace EventSecurityAPI.Controllers;


[ApiController]
[Route("api/events")]
public class EventController :
ControllerBase
{
    private readonly AppDbContext _context;

    public EventController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet] public IActionResult GetEvents()
    {
        var events = _context.Events.ToList();
        return Ok(events);
    }

    [HttpPost] public IActionResult CreateEvent([FromBody] Event newEvent)
    {
        _context.Events.Add(newEvent);
        _context.SaveChanges();

        return Ok(newEvent);
    }
}