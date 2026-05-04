public class RegisterRequest
{
    public int EventId { get; set; }
    public int AttendeeId { get; set; }
    public required string TicketType { get; set; }
}