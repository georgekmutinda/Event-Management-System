using System.Collections.Generic;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a vendor in the system.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (Vendor)
    /// - FK Reference Properties: Singular (User - references single entity)
    /// - Collection Navigation Properties: Plural (EventVendors)
    /// </summary>
    public class Vendor
    {
        public int VendorId { get; set; }

        /// <summary>
        /// Foreign key reference to the associated user (singular for many-to-one relationship)
        /// </summary>
        public int UserId { get; set; }
        public User User { get; set; }

        public string BusinessName { get; set; }
        public string ProductType { get; set; }
        public string Description { get; set; }
        public string? PhotoUrl { get; set; }
        public decimal AverageRating { get; set; } = 0;
        public int TotalReviews { get; set; } = 0;
        public string? Recommendations { get; set; }

        /// <summary>
        /// Collection of event-vendor associations (plural for one-to-many relationship)
        /// </summary>
        public ICollection<EventVendor> EventVendors { get; set; } = new List<EventVendor>();
    }
}