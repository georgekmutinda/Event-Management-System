using System.Collections.Generic;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a service provider profile in the system.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (ServiceProviderProfile)
    /// - FK Reference Properties: Singular (User - references single entity)
    /// - Collection Navigation Properties: Plural (EventServices)
    /// </summary>
    public class ServiceProviderProfile
    {
        public int ProviderId { get; set; }

        /// <summary>
        /// Foreign key reference to the associated user (singular for many-to-one relationship)
        /// </summary>
        public int UserId { get; set; }
        public User User { get; set; }

        public string ServiceType { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
        public string? PhotoUrl { get; set; }

        /// <summary>
        /// Collection of event-service associations (plural for one-to-many relationship)
        /// </summary>
        public ICollection<EventService> EventServices { get; set; } = new List<EventService>();
    }
}
