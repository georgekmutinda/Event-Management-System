namespace Application.DTOs
{
    /// <summary>
    /// Data Transfer Object for updating User information.
    /// All fields are optional to allow partial updates.
    /// </summary>
    public class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }
}
