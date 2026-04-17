namespace Application.DTOs
{
    /// <summary>
    /// DTO for returning event registration information.
    /// Contains all public information about an event registration.
    /// </summary>
    public class EventRegistrationResponseDto
    {
        /// <summary>
        /// The unique identifier for this registration.
        /// </summary>
        public int RegistrationId { get; set; }

        /// <summary>
        /// The ID of the event this registration is for.
        /// </summary>
        public int EventId { get; set; }

        /// <summary>
        /// The ID of the attendee registered for the event.
        /// </summary>
        public int AttendeeId { get; set; }

        /// <summary>
        /// The type of ticket for this registration (e.g., VIP, Standard, Student).
        /// </summary>
        public string TicketType { get; set; }

        /// <summary>
        /// The payment status for this registration (e.g., Pending, Completed, Failed).
        /// </summary>
        public string PaymentStatus { get; set; }

        /// <summary>
        /// The date and time when the registration was created.
        /// </summary>
        public DateTime RegisteredAt { get; set; }
    }
}
