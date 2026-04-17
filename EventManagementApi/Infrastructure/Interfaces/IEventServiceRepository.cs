using Domain.Entities;

namespace Infrastructure.Interfaces;

public interface IEventServiceRepository
{
    Task AddAsync(EventService eventService);
    Task<List<EventService>> GetAllAsync();
    Task DeleteAsync(int id);
}
