namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating a service provider profile.
    /// Contains required fields for service provider registration.
    /// </summary>
    public class CreateServiceProviderDto
    {
        public int UserId { get; set; }
        public string ServiceType { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
    }
}
