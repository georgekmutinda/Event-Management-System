namespace Application.DTOs
{
    /// <summary>
    /// DTO for responding with service provider profile information.
    /// Contains all relevant service provider details.
    /// </summary>
    public class ServiceProviderResponseDto
    {
        public int ProviderId { get; set; }
        public int UserId { get; set; }
        public string ServiceType { get; set; }
        public string CompanyName { get; set; }
        public string Description { get; set; }
        public string? PhotoUrl { get; set; }
    }
}
