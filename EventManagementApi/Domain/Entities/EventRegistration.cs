using System;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a user's registration for an event.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (EventRegistration)
    /// - FK Reference Properties: Singular (Event, Attendee - both reference single entities)
    /// </summary>
    public class EventRegistration
    {
        public int RegistrationId { get; set; }

        /// <summary>
        /// Foreign key reference to the event (singular for many-to-one relationship)
        /// </summary>
        public int EventId { get; set; }
        public Event Event { get; set; }

        /// <summary>
        /// Foreign key reference to the attendee/user (singular for many-to-one relationship)
        /// </summary>
        public int AttendeeId { get; set; }
        public User Attendee { get; set; }

        public string TicketType { get; set; }
        public string PaymentStatus { get; set; }

        public DateTime RegisteredAt { get; set; }
    }
}