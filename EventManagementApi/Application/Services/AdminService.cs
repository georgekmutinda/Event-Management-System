using System.Text.Json;
using Application.DTOs;
using Application.Interfaces;
using Domain.Data;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

namespace Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _db;
        private readonly IConnectionMultiplexer _redis;

        public AdminService(AppDbContext db, IConnectionMultiplexer redis)
        {
            _db = db;
            _redis = redis;
        }

        public async Task<List<ActiveSessionDto>> GetActiveSessionsAsync()
        {
            var redisDb = _redis.GetDatabase();
            var sessionIds = await redisDb.SetMembersAsync("sessions:active");
            var sessions = new List<ActiveSessionDto>();

            foreach (var sessionId in sessionIds)
            {
                if (sessionId.IsNullOrEmpty)
                {
                    continue;
                }

                var payload = await redisDb.StringGetAsync($"session:{sessionId}");
                if (payload.IsNullOrEmpty)
                {
                    await redisDb.SetRemoveAsync("sessions:active", sessionId);
                    continue;
                }

                var session = JsonSerializer.Deserialize<ActiveSessionDto>((string)payload!);
                if (session != null)
                {
                    sessions.Add(session);
                }
            }

            return sessions.OrderByDescending(item => item.LoginTime).ToList();
        }

        public async Task<bool> KickSessionAsync(string sessionId)
        {
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return false;
            }

            var redisDb = _redis.GetDatabase();
            var removed = await redisDb.KeyDeleteAsync($"session:{sessionId}");
            await redisDb.SetRemoveAsync("sessions:active", sessionId);
            return removed;
        }

        public async Task<List<BroadcastMessageResponseDto>> GetMessagesAsync()
        {
            return await _db.BroadcastMessages
                .OrderByDescending(item => item.SentAt)
                .Select(item => new BroadcastMessageResponseDto
                {
                    MessageId = item.MessageId,
                    Type = item.Type,
                    Text = item.Text,
                    SentBy = item.SentBy,
                    SentAt = item.SentAt
                })
                .ToListAsync();
        }

        public async Task<BroadcastMessageResponseDto> BroadcastAsync(BroadcastMessageRequestDto request, string sentBy)
        {
            if (string.IsNullOrWhiteSpace(request.Text))
            {
                throw new InvalidOperationException("Message text is required.");
            }

            var message = new BroadcastMessage
            {
                Type = string.IsNullOrWhiteSpace(request.Type) ? "info" : request.Type.Trim().ToLowerInvariant(),
                Text = request.Text.Trim(),
                SentBy = string.IsNullOrWhiteSpace(sentBy) ? "Admin" : sentBy.Trim(),
                SentAt = DateTime.UtcNow
            };

            _db.BroadcastMessages.Add(message);
            await _db.SaveChangesAsync();

            return new BroadcastMessageResponseDto
            {
                MessageId = message.MessageId,
                Type = message.Type,
                Text = message.Text,
                SentBy = message.SentBy,
                SentAt = message.SentAt
            };
        }

        public async Task<AdminAccountResponseDto> RegisterVendorAsync(AdminRegisterVendorDto request)
        {
            ValidateAccountRequest(request.FullName, request.Email, request.Password);

            if (string.IsNullOrWhiteSpace(request.BusinessName))
            {
                throw new InvalidOperationException("Business name is required.");
            }

            var role = await _db.Role.FirstOrDefaultAsync(item => item.RoleName == "Vendor")
                ?? throw new InvalidOperationException("Vendor role is missing.");

            await using var transaction = await _db.Database.BeginTransactionAsync();
            var user = await CreateUserAsync(request.FullName, request.Email, request.Password, role.RoleId);

            var vendor = new Vendor
            {
                UserId = user.UserId,
                BusinessName = request.BusinessName.Trim(),
                ProductType = string.IsNullOrWhiteSpace(request.ProductType) ? "General" : request.ProductType.Trim(),
                Description = request.Description?.Trim() ?? string.Empty
            };

            _db.Vendor.Add(vendor);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new AdminAccountResponseDto
            {
                UserId = user.UserId,
                ProfileId = vendor.VendorId,
                Role = "Vendor",
                Email = user.Email
            };
        }

        public async Task<AdminAccountResponseDto> RegisterServiceProviderAsync(AdminRegisterServiceProviderDto request)
        {
            ValidateAccountRequest(request.FullName, request.Email, request.Password);

            if (string.IsNullOrWhiteSpace(request.CompanyName) || string.IsNullOrWhiteSpace(request.ServiceType))
            {
                throw new InvalidOperationException("Company name and service type are required.");
            }

            var role = await _db.Role.FirstOrDefaultAsync(item => item.RoleName == "ServiceProvider")
                ?? throw new InvalidOperationException("ServiceProvider role is missing.");

            await using var transaction = await _db.Database.BeginTransactionAsync();
            var user = await CreateUserAsync(request.FullName, request.Email, request.Password, role.RoleId);

            var provider = new ServiceProviderProfile
            {
                UserId = user.UserId,
                CompanyName = request.CompanyName.Trim(),
                ServiceType = request.ServiceType.Trim(),
                Description = request.Description?.Trim() ?? string.Empty
            };

            _db.ServiceProviderProfile.Add(provider);
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();

            return new AdminAccountResponseDto
            {
                UserId = user.UserId,
                ProfileId = provider.ProviderId,
                Role = "ServiceProvider",
                Email = user.Email
            };
        }

        private async Task<User> CreateUserAsync(string fullName, string email, string password, int roleId)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();

            if (await _db.User.AnyAsync(item => item.Email.ToLower() == normalizedEmail))
            {
                throw new InvalidOperationException("An account with this email already exists.");
            }

            var user = new User
            {
                FullName = fullName.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
            };

            _db.User.Add(user);
            await _db.SaveChangesAsync();

            _db.UserRole.Add(new UserRole
            {
                UserId = user.UserId,
                RoleId = roleId
            });

            await _db.SaveChangesAsync();
            return user;
        }

        private static void ValidateAccountRequest(string fullName, string email, string password)
        {
            if (string.IsNullOrWhiteSpace(fullName) ||
                string.IsNullOrWhiteSpace(email) ||
                string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException("Full name, email, and password are required.");
            }

            if (password.Length < 8)
            {
                throw new InvalidOperationException("Password must be at least 8 characters long.");
            }
        }
    }
}
