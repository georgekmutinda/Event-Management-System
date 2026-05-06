using Domain.Entities;

namespace Infrastructure.Interfaces;

public interface IInvitationRepository
{
    Task AddAsync(Invitation invitation);
    Task<List<Invitation>> GetAllAsync();
    Task<Invitation?> GetByIdAsync(int id);
}
