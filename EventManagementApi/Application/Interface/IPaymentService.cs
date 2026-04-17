using Application.DTOs;

namespace Application.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto> CreateAsync(CreatePaymentDto dto);
        Task<List<PaymentResponseDto>> GetAllAsync();
        Task<PaymentResponseDto> GetByIdAsync(int id);
    }
}
