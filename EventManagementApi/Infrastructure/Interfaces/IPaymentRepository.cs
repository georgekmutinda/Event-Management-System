using Domain.Entities;

namespace Infrastructure.Interfaces;

public interface IPaymentRepository
{
    Task AddAsync(Payment payment);
    Task<List<Payment>> GetAllAsync();
    Task<Payment> GetByIdAsync(int id);
}
