namespace Application.DTOs
{
    /// <summary>Request body for POST /api/payments/redeem</summary>
    public class PaymentCodeRedemptionDto
    {
        /// <summary>The pre-paid code string, e.g. "EVT-2026-ABCXYZ".</summary>
        public string Code { get; set; }
        public int? EventId { get; set; }
    }

    /// <summary>Response returned when a code is successfully redeemed.</summary>
    public class PaymentCodeRedemptionResponseDto
    {
        public int    PaymentId   { get; set; }
        public string Code        { get; set; }
        public string EventName   { get; set; }
        public string Amount      { get; set; }   // formatted, e.g. "KES 4,500"
        public string Reference   { get; set; }   // confirmation reference
        public string Status      { get; set; }   // "Redeemed"
        public DateTime RedeemedAt { get; set; }
    }
}
