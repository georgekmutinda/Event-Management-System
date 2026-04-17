namespace Application.DTOs
{
    /// <summary>
    /// DTO for responding with payment information.
    /// Contains all relevant payment details.
    /// </summary>
    public class PaymentResponseDto
    {
        public int PaymentId { get; set; }
        public int UserId { get; set; }
        public int EventId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; }
        public DateTime PaymentDate { get; set; }
    }
}
