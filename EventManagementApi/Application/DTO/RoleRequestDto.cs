namespace Application.DTOs
{
    /// <summary>
    /// Data Transfer Object for creating/updating Roles.
    /// Contains all required fields for role creation.
    /// </summary>
    public class RoleRequestDto
    {
        /// <summary>
        /// Role name (required, must be unique)
        /// Examples: "Admin", "EventPlanner", "Vendor", "ServiceProvider"
        /// </summary>
        public string RoleName { get; set; }
    }
}
