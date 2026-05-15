namespace Application.DTOs
{
    public class PlannerEventSummaryDto
    {
        public int EventId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public decimal TicketPrice { get; set; }
        public int PaidRegistrations { get; set; }
        public int VendorCount { get; set; }
        public int ServiceProviderCount { get; set; }
    }

    public class PlannerPaidRegistrationDto
    {
        public int RegistrationId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public int AttendeeId { get; set; }
        public string AttendeeName { get; set; } = string.Empty;
        public string AttendeeEmail { get; set; } = string.Empty;
        public string TicketType { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
        public DateTime RegisteredAt { get; set; }
    }

    public class PlannerVendorDto
    {
        public int VendorId { get; set; }
        public int UserId { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public string? Recommendations { get; set; }
        public int EventCount { get; set; }
    }

    public class PlannerServiceProviderDto
    {
        public int ProviderId { get; set; }
        public int UserId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public int EventCount { get; set; }
    }
}
