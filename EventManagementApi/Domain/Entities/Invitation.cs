using System;

namespace Domain.Entities
{
    public class Invitation
    {
        public int InvitationId { get; set; }

        public string Email { get; set; }
        public string Role { get; set; }

        public int? EventId { get; set; }
        public Event? Event { get; set; }

        public int InvitedByUserId { get; set; }
        public User InvitedByUser { get; set; }

        public string Status { get; set; }
        public DateTime InvitedAt { get; set; }
    }
}
