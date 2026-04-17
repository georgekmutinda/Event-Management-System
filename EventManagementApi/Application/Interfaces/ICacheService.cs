namespace Application.Interfaces
{
    /// <summary>
    /// Interface for distributed cache service using Redis.
    /// Provides methods to get, set, remove, and manage cached data.
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Retrieves a cached value by key.
        /// Returns null/default if not found or expired.
        /// </summary>
        Task<T?> GetAsync<T>(string key);

        /// <summary>
        /// Caches a value with optional expiration time.
        /// Default expiration is managed by Redis configuration.
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);

        /// <summary>
        /// Removes a single cache entry by key.
        /// </summary>
        Task RemoveAsync(string key);

        /// <summary>
        /// Removes all cache entries matching a pattern (e.g., "users:*").
        /// Useful for cache invalidation across related entries.
        /// </summary>
        Task RemoveByPatternAsync(string pattern);
    }
}
