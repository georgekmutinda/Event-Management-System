namespace Application.DTOs
{
    /// <summary>
    /// DTO for returning event-vendor association information.
    /// Contains details about the relationship between an event and vendor.
    /// </summary>
    public class EventVendorResponseDto
    {
        /// <summary>
        /// The unique identifier for this event-vendor relationship.
        /// </summary>
        public int EventVendorId { get; set; }

        /// <summary>
        /// The ID of the event.
        /// </summary>
        public int EventId { get; set; }

        /// <summary>
        /// The ID of the vendor.
        /// </summary>
        public int VendorId { get; set; }

        /// <summary>
        /// The status of the vendor assignment (e.g., Pending, Approved, Rejected).
        /// </summary>
        public string Status { get; set; }
    }
}
