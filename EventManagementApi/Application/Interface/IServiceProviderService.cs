using Application.DTOs;

namespace Application.Interfaces
{
    public interface IServiceProviderService
    {
        Task<ServiceProviderResponseDto> CreateAsync(CreateServiceProviderDto dto);
        Task<List<ServiceProviderResponseDto>> GetAllAsync();
        Task<ServiceProviderResponseDto> GetByIdAsync(int id);
        Task<ServiceProviderResponseDto> UpdateAsync(int id, UpdateServiceProviderDto dto);
        Task DeleteAsync(int id);
    }
}
