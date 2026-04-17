using System;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a payment transaction in the system.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (Payment)
    /// - FK Reference Properties: Singular (User, Event - both reference single entities)
    /// </summary>
    public class Payment
    {
        public int PaymentId { get; set; }

        /// <summary>
        /// Foreign key reference to the user making the payment (singular for many-to-one relationship)
        /// </summary>
        public int UserId { get; set; }
        public User User { get; set; }

        /// <summary>
        /// Foreign key reference to the event being paid for (singular for many-to-one relationship)
        /// </summary>
        public int EventId { get; set; }
        public Event Event { get; set; }

        public decimal Amount { get; set; }
        public string PaymentStatus { get; set; }

        public DateTime PaymentDate { get; set; }
    }
}