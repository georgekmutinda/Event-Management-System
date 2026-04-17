namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating a payment record.
    /// Contains required fields for processing a payment.
    /// </summary>
    public class CreatePaymentDto
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
        public decimal Amount { get; set; }
    }
}
