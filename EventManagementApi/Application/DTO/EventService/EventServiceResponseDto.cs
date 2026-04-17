namespace Application.DTOs
{
    /// <summary>
    /// DTO for responding with event service information.
    /// Contains details about a service linked to an event.
    /// </summary>
    public class EventServiceResponseDto
    {
        public int EventServiceId { get; set; }
        public int EventId { get; set; }
        public int ProviderId { get; set; }
        public string ServiceDetails { get; set; }
        public string Status { get; set; }
    }
}
