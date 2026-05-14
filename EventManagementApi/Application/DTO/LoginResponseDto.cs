namespace Application.DTOs
{
    /// <summary>
    /// Returned by POST /api/auth/login.
    /// Contains the JWT bearer token, basic user info, the user's role,
    /// and a session ID used by the Admin Panel to track and kick sessions.
    /// </summary>
    public class LoginResponseDto
    {
        public string Token     { get; set; }
        public string Email     { get; set; }
        public int    UserId    { get; set; }
        public string FullName  { get; set; }
        public string Role      { get; set; }
        public int    ExpiresIn { get; set; }

        /// <summary>
        /// Unique session identifier stored in Redis.
        /// The client should persist this (sessionStorage) and send it
        /// when logging out so the session can be removed from Redis.
        /// </summary>
        public string SessionId { get; set; }
    }
}
