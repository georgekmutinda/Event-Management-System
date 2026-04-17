using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ServiceProviderRepository : IServiceProviderRepository
{
    private readonly AppDbContext _context;

    public ServiceProviderRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(ServiceProviderProfile serviceProvider)
    {
        await _context.ServiceProviderProfile.AddAsync(serviceProvider);
        await _context.SaveChangesAsync();
    }

    public async Task<List<ServiceProviderProfile>> GetAllAsync()
    {
        return await _context.ServiceProviderProfile
            .Include(sp => sp.User)
            .ToListAsync();
    }

    public async Task<ServiceProviderProfile> GetByIdAsync(int id)
    {
        return await _context.ServiceProviderProfile
            .Include(sp => sp.User)
            .FirstOrDefaultAsync(sp => sp.ProviderId == id);
    }

    public async Task UpdateAsync(ServiceProviderProfile serviceProvider)
    {
        _context.ServiceProviderProfile.Update(serviceProvider);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var serviceProvider = await _context.ServiceProviderProfile.FindAsync(id);
        if (serviceProvider != null)
        {
            _context.ServiceProviderProfile.Remove(serviceProvider);
            await _context.SaveChangesAsync();
        }
    }
}
