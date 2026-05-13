using Application.DTOs.Auth;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAuthService
    {
        Task RegisterAsync(RegisterRequestDto request);
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    }
}
