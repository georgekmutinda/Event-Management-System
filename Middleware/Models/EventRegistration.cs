namespace EventSecurityAPI.Models;

public class EventRegistration
{
    public int RegistrationId{get; set;}
    public int EventId{get; set;}
    public int AttendeeId{get; set;}
    public required string TicketType{get; set;}
    public required string PaymentStatus{get; set;}
    public DateTime RegisteredAt{get; set;}
}