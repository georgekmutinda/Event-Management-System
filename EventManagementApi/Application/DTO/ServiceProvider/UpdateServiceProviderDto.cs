namespace Application.DTOs
{
    /// <summary>
    /// DTO for updating a service provider profile.
    /// Supports partial updates of service provider information.
    /// </summary>
    public class UpdateServiceProviderDto
    {
        public string ServiceType { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
