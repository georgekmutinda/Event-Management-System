namespace Application.DTOs.Auth
{
    public class RegisterRequestDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        // 🔥 MULTIPLE ROLES
        public List<string> Roles { get; set; }
    }
}