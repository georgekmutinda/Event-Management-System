using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating a payment record.
    /// Contains required fields for processing a payment.
    /// </summary>
    public class CreatePaymentDto
    {
        [Range(1, int.MaxValue, ErrorMessage = "UserId is required")]
        public int UserId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "EventId is required")]
        public int EventId { get; set; }

        [Range(0.01, 999999999, ErrorMessage = "Amount must be greater than zero")]
        public decimal Amount { get; set; }
    }
}
