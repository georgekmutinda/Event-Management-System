namespace Application.DTOs
{
    /// <summary>
    /// DTO for creating an event-vendor association.
    /// Links a vendor to an event.
    /// </summary>
    public class EventVendorRequestDto
    {
        /// <summary>
        /// The ID of the event.
        /// </summary>
        public int EventId { get; set; }

        /// <summary>
        /// The ID of the vendor to associate with the event.
        /// </summary>
        public int VendorId { get; set; }
    }
}
