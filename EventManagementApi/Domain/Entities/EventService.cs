namespace Domain.Entities
{
    /// <summary>
    /// Represents the many-to-many relationship between Event and ServiceProviderProfile.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (EventService)
    /// - FK Reference Properties: Singular (Event, Provider - both reference single entities)
    /// </summary>
    public class EventService
    {
        public int EventServiceId { get; set; }

        /// <summary>
        /// Foreign key reference to the event (singular for many-to-one relationship)
        /// </summary>
        public int EventId { get; set; }
        public Event Event { get; set; }

        /// <summary>
        /// Foreign key reference to the service provider (singular for many-to-one relationship)
        /// </summary>
        public int ProviderId { get; set; }
        public ServiceProviderProfile Provider { get; set; }

        public string ServiceDetails { get; set; }
        public string Status { get; set; } // Pending, Approved, Rejected
    }
}