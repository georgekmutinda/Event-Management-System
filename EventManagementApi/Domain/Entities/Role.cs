using System.Collections.Generic;

namespace Domain.Entities
{
    /// <summary>
    /// Represents a user role in the system.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (Role) - represents a single role entity
    /// - Navigation Property: Plural (UserRoles) - collection of user-role associations
    /// </summary>
    public class Role
    {
        public int RoleId { get; set; }
        public string RoleName { get; set; }

        /// <summary>
        /// Collection of UserRole associations (plural name for collection)
        /// </summary>
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }
}
