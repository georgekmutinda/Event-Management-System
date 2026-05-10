namespace EventSecurityAPI.Models;

public class Event
{
    public int EventId{get; set;}
    public int PlannerId{get; set;}
    public required string Title{get; set;}
    public string? Description{get; set;}
    public required string Location{get; set;}
    public DateTime EventDate{get; set;}

}