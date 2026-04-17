using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a user in the system.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (User)
    /// - FK Reference Properties: Singular (Planner is referenced in Event, not EventsCreated)
    /// - Collection Navigation Properties: Plural (UserRoles, EventsCreated, Registrations, Payments)
    /// </summary>
    [Table("User")] // Explicitly specify table name to avoid pluralization issues
    public class User
    {
        public int UserId { get; set; }

        public string FullName { get; set; } 

        public string Email { get; set; } 
        public string PasswordHash { get; set; } 
      
        /// <summary>
        /// Collection of user-role assignments (plural for collection)
        /// </summary>
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        /// <summary>
        /// Collection of events created by this user (plural for collection)
        /// </summary>
        public ICollection<Event> EventsCreated { get; set; } = new List<Event>();

        /// <summary>
        /// Collection of event registrations for this user as attendee (plural for collection)
        /// </summary>
        public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();

        /// <summary>
        /// Collection of payments made by this user (plural for collection)
        /// </summary>
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}