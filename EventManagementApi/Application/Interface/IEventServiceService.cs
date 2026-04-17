using Application.DTOs;

namespace Application.Interfaces
{
    public interface IEventServiceService
    {
        Task<EventServiceResponseDto> CreateAsync(CreateEventServiceDto dto);
        Task<List<EventServiceResponseDto>> GetAllAsync();
        Task DeleteAsync(int id);
    }
}
