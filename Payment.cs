namespace EventSecurityAPI.Models;

public class Payment
{
    public int PaymentId{get; set;}
    public int UserId{get; set;}
    public int EventId{get; set;}
    public decimal Amount{get; set;}
    public required string PaymentStatus{get; set;}
    public DateTime PaymentDate{get; set;}

}