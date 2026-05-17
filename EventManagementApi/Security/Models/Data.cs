namespace EventManagementApi.Security.Models
{
        public class SqlData
    {
        public float ContainsOr { get; set; }
        public float ContainsUnion { get; set; }
        public float ContainsComment { get; set; }
        public float QuoteCount { get; set; }
        public float QueryLength { get; set; }
        public bool Label { get; set; } // 0 = normal, 1 = malicious
    }

}