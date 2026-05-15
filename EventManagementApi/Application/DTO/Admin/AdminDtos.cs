namespace Application.DTOs
{
    public class ActiveSessionDto
    {
        public string SessionId { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Ip { get; set; } = string.Empty;
        public DateTime LoginTime { get; set; }
    }

    public class BroadcastMessageRequestDto
    {
        public string Type { get; set; } = "info";
        public string Text { get; set; } = string.Empty;
    }

    public class BroadcastMessageResponseDto
    {
        public int MessageId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string SentBy { get; set; } = string.Empty;
        public DateTime SentAt { get; set; }
    }

    public class AdminRegisterVendorDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string BusinessName { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public string? Recommendations { get; set; }
    }

    public class AdminRegisterServiceProviderDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string ServiceType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class AdminAccountResponseDto
    {
        public int UserId { get; set; }
        public int ProfileId { get; set; }
        public string Role { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
