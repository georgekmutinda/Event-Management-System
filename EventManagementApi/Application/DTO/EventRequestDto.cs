namespace Application.DTOs
{
    /// <summary>
    /// Data Transfer Object for creating/updating Events.
    /// Contains all required fields for event creation.
    /// </summary>
    public class EventRequestDto
    {
        /// <summary>
        /// Event title (required)
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Event description (optional)
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Event location (required)
        /// </summary>
        public string Location { get; set; }

        /// <summary>
        /// Event date and time (required)
        /// </summary>
        public DateTime EventDate { get; set; }

        /// <summary>
        /// Ticket price charged for this event.
        /// </summary>
        public decimal TicketPrice { get; set; }

        /// <summary>
        /// ID of the user planning this event (required, must be valid user ID)
        /// </summary>
        public int PlannerId { get; set; }
    }
}
