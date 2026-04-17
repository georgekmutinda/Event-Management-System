namespace Domain.Entities
{
    /// <summary>
    /// Represents the many-to-many relationship between Event and Vendor.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (EventVendor)
    /// - FK Reference Properties: Singular (Event, Vendor - both reference single entities)
    /// </summary>
    public class EventVendor
    {
        public int EventVendorId { get; set; }

        /// <summary>
        /// Foreign key reference to the event (singular for many-to-one relationship)
        /// </summary>
        public int EventId { get; set; }
        public Event Event { get; set; }

        /// <summary>
        /// Foreign key reference to the vendor (singular for many-to-one relationship)
        /// </summary>
        public int VendorId { get; set; }
        public Vendor Vendor { get; set; }

        public string Status { get; set; } // Pending, Approved, Rejected
    }
}