using System;
using System.Collections.Generic;

namespace Domain.Entities
{
    /// <summary>
    /// Represents an event in the system.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (Event)
    /// - FK Reference Properties: Singular (Planner references single User)
    /// - Collection Navigation Properties: Plural (Registrations, EventVendors, EventServices, Payments)
    /// </summary>
    public class Event
    {
        public int EventId { get; set; }

        /// <summary>
        /// Foreign key reference to the event planner (singular for many-to-one relationship)
        /// </summary>
        public int PlannerId { get; set; }
        public User Planner { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public decimal TicketPrice { get; set; }

        public DateTime EventDate { get; set; }
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Collection of event registrations (plural for one-to-many relationship)
        /// </summary>
        public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();

        /// <summary>
        /// Collection of vendors assigned to this event (plural for many-to-many relationship)
        /// </summary>
        public ICollection<EventVendor> EventVendors { get; set; } = new List<EventVendor>();

        /// <summary>
        /// Collection of services assigned to this event (plural for many-to-many relationship)
        /// </summary>
        public ICollection<EventService> EventServices { get; set; } = new List<EventService>();

        /// <summary>
        /// Collection of payments for this event (plural for one-to-many relationship)
        /// </summary>
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
