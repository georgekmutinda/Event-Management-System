using Application.DTOs;

namespace Application.Interfaces
{
    public interface IAdminService
    {
        Task<List<ActiveSessionDto>> GetActiveSessionsAsync();
        Task<bool> KickSessionAsync(string sessionId);
        Task<List<BroadcastMessageResponseDto>> GetMessagesAsync();
        Task<BroadcastMessageResponseDto> BroadcastAsync(BroadcastMessageRequestDto request, string sentBy);
        Task<AdminAccountResponseDto> RegisterVendorAsync(AdminRegisterVendorDto request);
        Task<AdminAccountResponseDto> RegisterServiceProviderAsync(AdminRegisterServiceProviderDto request);
    }
}
