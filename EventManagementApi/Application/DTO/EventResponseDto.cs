namespace Application.DTOs
{
    /// <summary>
    /// Data Transfer Object for returning Event data.
    /// Contains all event information safe to expose to clients.
    /// </summary>
    public class EventResponseDto
    {
        /// <summary>
        /// Unique identifier for the event
        /// </summary>
        public int EventId { get; set; }

        /// <summary>
        /// Event title
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Event description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Event location
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// Event date and time
        /// </summary>
        public DateTime EventDate { get; set; }

        /// <summary>
        /// Ticket price charged for the event
        /// </summary>
        public decimal TicketPrice { get; set; }

        /// <summary>
        /// ID of the event planner (user)
        /// </summary>
        public int PlannerId { get; set; }

        /// <summary>
        /// Timestamp when event was created
        /// </summary>
        public DateTime CreatedAt { get; set; }
    }
}
