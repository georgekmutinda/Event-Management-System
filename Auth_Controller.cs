using Microsoft.AspNetCore.Mvc;
using EventSecurityAPI.Data;

namespace EventSecurityAPI.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : 
ControllerBase
{
    private readonly AppDbContext _context;

    public AuthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        var user = _context.Users.FirstOrDefault
        (u => u.Email == request.Email && u.PasswordHash == request.Password);

        if(user == null)
            return Unauthorized("Invalid Credentials!");
        
        return Ok(new { Message = "Login Successful!", user.UserId });
    }
}