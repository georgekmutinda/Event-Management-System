namespace Domain.Entities
{
    /// <summary>
    /// Represents the many-to-many relationship between User and Role.
    /// 
    /// Naming Convention Applied:
    /// - Class Name: Singular (UserRole) - represents a single user-role assignment
    /// - FK Reference Properties: Singular (User, Role) - single entity references
    /// </summary>
    public class UserRole
    {
        /// <summary>
        /// Foreign key reference to Role (singular for many-to-one relationship)
        /// </summary>
        public int RoleId { get; set; }
        public Role Role { get; set; }

        /// <summary>
        /// Foreign key reference to User (singular for many-to-one relationship)
        /// </summary>
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
