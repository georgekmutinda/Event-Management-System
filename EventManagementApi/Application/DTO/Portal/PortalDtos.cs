using System;
using System.Collections.Generic;

namespace Application.DTOs
{
    public class VendorDashboardDto
    {
        public int AssignedEvents { get; set; }
        public int UniqueEvents { get; set; }
        public int ApprovedAssignments { get; set; }
        public int PendingAssignments { get; set; }
        public decimal RevenuePotential { get; set; }
        public List<VendorAssignmentDto> RecentAssignments { get; set; } = new();
    }

    public class VendorAssignmentDto
    {
        public int AssignmentId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PlannerName { get; set; } = string.Empty;
    }

    public class VendorProfileDto
    {
        public int VendorId { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public string? Recommendations { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public int AssignedEventCount { get; set; }
    }

    public class ProviderDashboardDto
    {
        public int AssignedServices { get; set; }
        public int UniqueEvents { get; set; }
        public int ApprovedServices { get; set; }
        public int PendingServices { get; set; }
        public List<ProviderServiceDto> RecentServices { get; set; } = new();
    }

    public class ProviderServiceDto
    {
        public int ServiceId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public string ServiceDetails { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PlannerName { get; set; } = string.Empty;
    }

    public class ProviderProfileDto
    {
        public int ProviderId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public int AssignedServiceCount { get; set; }
    }

    public class PortalPhotoUpdateDto
    {
        public string? PhotoUrl { get; set; }
    }

    public class PortalBidDto
    {
        public int EventId { get; set; }
        public string? ServiceDetails { get; set; }
    }
}
