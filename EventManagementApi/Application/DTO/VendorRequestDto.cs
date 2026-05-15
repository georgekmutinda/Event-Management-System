namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating or updating a vendor.
    /// Contains required fields for vendor management.
    /// </summary>
    public class VendorRequestDto
    {
        /// <summary>
        /// The ID of the user (vendor account holder).
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// The business name of the vendor.
        /// </summary>
        public string BusinessName { get; set; } = string.Empty;

        /// <summary>
        /// The type of product or service offered by the vendor
        /// (e.g., Catering, Decoration, Photography).
        /// </summary>
        public string ProductType { get; set; } = string.Empty;

        /// <summary>
        /// A description of the vendor's business and services.
        /// </summary>
        public string Description { get; set; } = string.Empty;

        public string? PhotoUrl { get; set; }

        public string? Recommendations { get; set; }
    }
}
