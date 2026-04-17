using Domain.Data;
using Domain.Entities;
using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Payment payment)
    {
        await _context.Payment.AddAsync(payment);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Payment>> GetAllAsync()
    {
        return await _context.Payment
            .Include(p => p.User)
            .Include(p => p.Event)
            .ToListAsync();
    }

    public async Task<Payment> GetByIdAsync(int id)
    {
        return await _context.Payment
            .Include(p => p.User)
            .Include(p => p.Event)
            .FirstOrDefaultAsync(p => p.PaymentId == id);
    }
}
