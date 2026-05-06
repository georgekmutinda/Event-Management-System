using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class CreateInvitationDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 2)]
        public string Role { get; set; }

        public int? EventId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "InvitedByUserId is required")]
        public int InvitedByUserId { get; set; }
    }
}
