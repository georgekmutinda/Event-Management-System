using Domain.Entities;

namespace Infrastructure.Interfaces;

public interface IServiceProviderRepository
{
    Task AddAsync(ServiceProviderProfile serviceProvider);
    Task<List<ServiceProviderProfile>> GetAllAsync();
    Task<ServiceProviderProfile> GetByIdAsync(int id);
    Task UpdateAsync(ServiceProviderProfile serviceProvider);
    Task DeleteAsync(int id);
}
