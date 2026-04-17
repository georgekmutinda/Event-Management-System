namespace Application.DTOs
{
    /// <summary>
    /// Data Transfer Object for User response.
    /// Excludes sensitive data like PasswordHash.
    /// </summary>
    public class UserResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
    }
}
