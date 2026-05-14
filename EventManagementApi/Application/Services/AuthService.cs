using Application.DTOs;
using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Data;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Text.Json;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly JwtTokenService _jwt;
        private readonly IConnectionMultiplexer _redis;
        private readonly IHttpContextAccessor _http;

        public AuthService(
            AppDbContext db,
            JwtTokenService jwt,
            IConnectionMultiplexer redis,
            IHttpContextAccessor http)
        {
            _db = db;
            _jwt = jwt;
            _redis = redis;
            _http = http;
        }

        public async Task RegisterAsync(RegisterRequestDto dto)
        {
            if (await _db.User.AnyAsync(user => user.Email == dto.Email))
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }

            var requestedRoles = dto.Roles?
                .Where(role => !string.IsNullOrWhiteSpace(role))
                .Select(role => role.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList() ?? new List<string>();

            if (requestedRoles.Count == 0)
            {
                requestedRoles.Add("Attendee");
            }

            if (requestedRoles.Any(role => role.Equals("Admin", StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException("Admin accounts can only be created from system administration.");
            }

            var roles = await _db.Role
                .Where(role => requestedRoles.Contains(role.RoleName))
                .ToListAsync();

            if (roles.Count != requestedRoles.Count)
            {
                throw new InvalidOperationException("One or more requested roles do not exist.");
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _db.User.Add(user);
            await _db.SaveChangesAsync();

            foreach (var role in roles)
            {
                _db.UserRole.Add(new UserRole
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId
                });
            }

            await _db.SaveChangesAsync();
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
        {
            var user = await _db.User
                .Include(item => item.UserRoles)
                .ThenInclude(item => item.Role)
                .FirstOrDefaultAsync(item => item.Email == dto.Email)
                ?? throw new UnauthorizedAccessException("Invalid email or password.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            var roles = user.UserRoles
                .Select(item => item.Role)
                .Where(item => item != null)
                .ToList();

            var primaryRole = roles.FirstOrDefault()?.RoleName ?? "Attendee";
            var token = _jwt.GenerateToken(user, roles!);
            var sessionId = Guid.NewGuid().ToString("N");

            var session = new ActiveSessionDto
            {
                SessionId = sessionId,
                UserId = user.UserId,
                UserName = user.FullName,
                Email = user.Email,
                Role = primaryRole,
                Ip = _http.HttpContext?.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                LoginTime = DateTime.UtcNow
            };

            var redisDb = _redis.GetDatabase();
            var tokenTtl = TimeSpan.FromHours(24);

            await redisDb.StringSetAsync(
                $"session:{sessionId}",
                JsonSerializer.Serialize(session),
                tokenTtl);

            await redisDb.SetAddAsync("sessions:active", sessionId);

            return new LoginResponseDto
            {
                Token = token,
                Email = user.Email,
                UserId = user.UserId,
                FullName = user.FullName,
                Role = primaryRole,
                ExpiresIn = (int)tokenTtl.TotalSeconds,
                SessionId = sessionId
            };
        }
    }
}
