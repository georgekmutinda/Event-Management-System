namespace Domain.Entities
{
    /// <summary>
    /// A pre-paid payment code that can be redeemed by an attendee
    /// at checkout instead of completing a live payment.
    ///
    /// Codes are generated externally (e.g. by an event organiser) and
    /// issued to attendees who have already paid by other means.
    /// </summary>
    public class PaymentCode
    {
        public int     PaymentCodeId { get; set; }
 
        /// <summary>The unique code string, e.g. "EVT-2026-ABCXYZ".</summary>
        public string  Code          { get; set; }
 
        /// <summary>Pre-authorised amount this code covers (KES).</summary>
        public decimal Amount        { get; set; }
 
        /// <summary>Human-readable event name shown in the redemption confirmation.</summary>
        public string  EventName     { get; set; }
 
        /// <summary>Foreign key to the Event this code is valid for (nullable = any event).</summary>
        public int?    EventId       { get; set; }
        public Event   Event         { get; set; }
 
        /// <summary>Whether this code has already been redeemed.</summary>
        public bool    IsRedeemed    { get; set; } = false;
 
        /// <summary>UTC timestamp of redemption; null if not yet used.</summary>
        public DateTime? RedeemedAt  { get; set; }
 
        /// <summary>FK to the Payment record created on redemption.</summary>
        public int?    PaymentId     { get; set; }
        public Payment Payment       { get; set; }
 
        public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;
    }
}