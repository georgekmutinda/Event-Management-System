namespace Domain.Entities
{
    public class BroadcastMessage
    {
        public int MessageId { get; set; }
        public string Type { get; set; } = "info";
        public string Text { get; set; } = string.Empty;
        public string SentBy { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
