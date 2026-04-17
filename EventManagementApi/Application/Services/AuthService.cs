using Application.DTOs.Auth;
using Application.Interfaces;
using Domain.Entities;
using Infrastructure.Interfaces;
using BCrypt.Net;

namespace Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtTokenService _jwtTokenService;
        private readonly IRabbitMqService _rabbitMqService;

        public AuthService(
            IUserRepository userRepository, 
            JwtTokenService jwtTokenService,
            IRabbitMqService rabbitMqService)
        {
            _userRepository = userRepository;
            _jwtTokenService = jwtTokenService;
            _rabbitMqService = rabbitMqService;
        }

        public async Task RegisterAsync(RegisterRequestDto request)
        {
            // 1. Check if user exists
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);

            if (existingUser != null)
                throw new Exception("User already exists");

            // 2. Create user
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            await _userRepository.AddUserAsync(user);

            // 3. Assign roles (ONLY if they exist in DB)
            foreach (var roleName in request.Roles)
            {
                var role = await _userRepository.GetRoleByNameAsync(roleName);

                if (role == null)
                    continue; // skip invalid roles safely

                var userRole = new UserRole
                {
                    UserId = user.UserId,
                    RoleId = role.RoleId
                };

                await _userRepository.AddUserRoleAsync(userRole);
            }

            // 4. Publish UserRegistered event to RabbitMQ
            await _rabbitMqService.PublishAsync("UserRegistered", new
            {
                userId = user.UserId,
                email = user.Email,
                fullName = user.FullName,
                timestamp = DateTime.UtcNow
            });
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            // 1. Find user by email
            var user = await _userRepository.GetByEmailAsync(request.Email);

            if (user == null)
                throw new Exception("Invalid credentials");

            // 2. Verify password using BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
                throw new Exception("Invalid credentials");

            // 3. Load user roles from UserRole table
            var roles = await _userRepository.GetUserRolesAsync(user.UserId);

            // 4. Generate JWT token (1 hour expiry)
            var token = _jwtTokenService.GenerateToken(user, roles);

            // 5. Return LoginResponseDto
            return new LoginResponseDto
            {
                Token = token,
                ExpiresIn = 3600 // 1 hour in seconds
            };
        }
    }
}