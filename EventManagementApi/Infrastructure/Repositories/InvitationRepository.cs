using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class InvitationRepository : IInvitationRepository
{
    private readonly AppDbContext _context;

    public InvitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Invitation invitation)
    {
        await _context.Invitation.AddAsync(invitation);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Invitation>> GetAllAsync()
    {
        return await _context.Invitation
            .Include(i => i.Event)
            .Include(i => i.InvitedByUser)
            .OrderByDescending(i => i.InvitedAt)
            .ToListAsync();
    }

    public async Task<Invitation?> GetByIdAsync(int id)
    {
        return await _context.Invitation
            .Include(i => i.Event)
            .Include(i => i.InvitedByUser)
            .FirstOrDefaultAsync(i => i.InvitationId == id);
    }
}
