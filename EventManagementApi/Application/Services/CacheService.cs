using StackExchange.Redis;
using System.Text.Json;
using Application.Interfaces;

namespace Application.Services
{
    /// <summary>
    /// Service for managing Redis distributed caching.
    /// Provides methods to get, set, and manage cached data across the application.
    /// </summary>
    public class CacheService : ICacheService
    {
        private readonly IDatabase _db;
        private readonly IConnectionMultiplexer _redis;

        public CacheService(IConnectionMultiplexer redis)
        {
            _redis = redis;
            _db = redis.GetDatabase();
        }

        /// <summary>
        /// Retrieves a cached value by key. Returns null if not found or expired.
        /// </summary>
        public async Task<T?> GetAsync<T>(string key)
        {
            try
            {
                var value = await _db.StringGetAsync(key);
                if (!value.HasValue)
                    return default;

                return JsonSerializer.Deserialize<T>(value.ToString());
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - cache failures should not crash the app
                Console.WriteLine($"Cache get error for key '{key}': {ex.Message}");
                return default;
            }
        }

        /// <summary>
        /// Stores a value in cache with optional expiry time.
        /// </summary>
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                var json = JsonSerializer.Serialize(value);
                await _db.StringSetAsync(key, json, expiry);
            }
            catch (Exception ex)
            {
                // Log the error but don't throw - cache failures should not crash the app
                Console.WriteLine($"Cache set error for key '{key}': {ex.Message}");
            }
        }

        /// <summary>
        /// Removes a specific key from cache.
        /// </summary>
        public async Task RemoveAsync(string key)
        {
            try
            {
                await _db.KeyDeleteAsync(key);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Cache remove error for key '{key}': {ex.Message}");
            }
        }

        /// <summary>
        /// Removes all keys matching a pattern from cache (e.g., "event:*").
        /// </summary>
        public async Task RemoveByPatternAsync(string pattern)
        {
            try
            {
                var server = _redis.GetServer(_redis.GetEndPoints().First());
                var keys = server.Keys(pattern: pattern).ToArray();
                if (keys.Length > 0)
                {
                    await _db.KeyDeleteAsync(keys);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Cache remove by pattern error for pattern '{pattern}': {ex.Message}");
            }
        }
    }
}
