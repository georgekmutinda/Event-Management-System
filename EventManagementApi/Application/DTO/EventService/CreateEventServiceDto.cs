namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating an event service connection.
    /// Links a service provider to an event.
    /// </summary>
    public class CreateEventServiceDto
    {
        public int EventId { get; set; }
        public int ProviderId { get; set; }
        public string ServiceDetails { get; set; }
    }
}
