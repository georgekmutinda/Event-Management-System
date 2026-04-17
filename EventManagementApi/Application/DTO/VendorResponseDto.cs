namespace Application.DTOs
{
    /// <summary>
    /// DTO for returning vendor information.
    /// Contains all public information about a vendor.
    /// </summary>
    public class VendorResponseDto
    {
        /// <summary>
        /// The unique identifier for this vendor.
        /// </summary>
        public int VendorId { get; set; }

        /// <summary>
        /// The ID of the user associated with this vendor.
        /// </summary>
        public int UserId { get; set; }

        /// <summary>
        /// The business name of the vendor.
        /// </summary>
        public string BusinessName { get; set; }

        /// <summary>
        /// The type of product or service offered by the vendor.
        /// </summary>
        public string ProductType { get; set; }

        /// <summary>
        /// A description of the vendor's business and services.
        /// </summary>
        public string Description { get; set; }
    }
}
