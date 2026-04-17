namespace Application.DTOs
{
    /// <summary>
    /// Data Transfer Object for returning Role data.
    /// Contains all role information safe to expose to clients.
    /// </summary>
    public class RoleResponseDto
    {
        /// <summary>
        /// Unique identifier for the role
        /// </summary>
        public int RoleId { get; set; }

        /// <summary>
        /// Role name (unique)
        /// </summary>
        public string RoleName { get; set; }
    }
}
