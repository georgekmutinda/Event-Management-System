using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class EventServiceRepository : IEventServiceRepository
{
    private readonly AppDbContext _context;

    public EventServiceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(EventService eventService)
    {
        await _context.EventService.AddAsync(eventService);
        await _context.SaveChangesAsync();
    }

    public async Task<List<EventService>> GetAllAsync()
    {
        return await _context.EventService
            .Include(es => es.Event)
            .Include(es => es.Provider)
            .ToListAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var eventService = await _context.EventService.FindAsync(id);
        if (eventService != null)
        {
            _context.EventService.Remove(eventService);
            await _context.SaveChangesAsync();
        }
    }
}
