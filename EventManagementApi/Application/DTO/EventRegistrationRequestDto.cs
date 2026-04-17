namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating a new event registration.
    /// Contains required fields for registering a user to an event.
    /// </summary>
    public class EventRegistrationRequestDto
    {
        /// <summary>
        /// The ID of the event to register for.
        /// </summary>
        public int EventId { get; set; }

        /// <summary>
        /// The ID of the user (attendee) registering for the event.
        /// </summary>
        public int AttendeeId { get; set; }
    }
}
