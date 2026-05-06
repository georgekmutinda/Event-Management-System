using Application.DTOs;

namespace Application.Interfaces
{
    public interface IInvitationService
    {
        Task<InvitationResponseDto> CreateAsync(CreateInvitationDto dto);
        Task<List<InvitationResponseDto>> GetAllAsync();
        Task<InvitationResponseDto> GetByIdAsync(int id);
    }
}
