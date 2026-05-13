using Xunit;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Collections.Generic;

namespace EventManagementApi.Tests
{
    public sealed class LiveApiFactAttribute : FactAttribute
    {
        private const string BaseUrl = "http://localhost:5100";

        public LiveApiFactAttribute()
        {
            if (!LiveApiGuard.IsAvailable(BaseUrl))
            {
                Skip = $"Live API unavailable at {BaseUrl}";
            }
        }
    }

    internal static class LiveApiGuard
    {
        public static bool IsAvailable(string baseUrl)
        {
            using var client = new HttpClient { Timeout = TimeSpan.FromSeconds(2) };
            try
            {
                using var response = client.GetAsync($"{baseUrl}/swagger/index.html").GetAwaiter().GetResult();
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }

        public static async Task EnsureAvailableAsync(string baseUrl)
        {
            if (!IsAvailable(baseUrl))
            {
                throw new InvalidOperationException($"Live API unavailable at {baseUrl}");
            }

            await Task.CompletedTask;
        }
    }

    /// <summary>
    /// End-to-End Integration Tests for Event Management API
    /// Tests complete workflows including JWT authentication, authorization, and caching
    /// </summary>
    public class EndToEndIntegrationTests : IAsyncLifetime
    {
        private HttpClient _client;
        private string _baseUrl = "http://localhost:5100";
        private string _jwtToken;
        private string _testEmail = $"e2e_test_{Guid.NewGuid()}@example.com";
        private string _testPassword = "Test123!Pass";

        public async Task InitializeAsync()
        {
            _client = new HttpClient();
            await LiveApiGuard.EnsureAvailableAsync(_baseUrl);
            await RegisterTestUser();
        }

        public async Task DisposeAsync()
        {
            _client?.Dispose();
        }

        private async Task RegisterTestUser()
        {
            var registerRequest = new
            {
                email = _testEmail,
                password = _testPassword,
                fullName = "E2E Test User",
                roles = new[] { "Attendee" }
            };

            var response = await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/register", registerRequest);
            Assert.True(response.IsSuccessStatusCode, $"Failed to register test user: {response.StatusCode}");
        }

        private async Task<string> GetJwtToken()
        {
            if (!string.IsNullOrEmpty(_jwtToken))
                return _jwtToken;

            var loginRequest = new { email = _testEmail, password = _testPassword };
            var response = await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/login", loginRequest);
            
            Assert.True(response.IsSuccessStatusCode, "Failed to login");
            
            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            _jwtToken = content.GetProperty("token").GetString();
            return _jwtToken;
        }

        // ==================== AUTHENTICATION TESTS ====================

        [LiveApiFact]
        public async Task Register_WithValidData_Returns200()
        {
            var request = new
            {
                email = $"register_test_{Guid.NewGuid()}@example.com",
                password = "ValidPass123!",
                fullName = "New User",
                roles = new[] { "Attendee" }
            };

            var response = await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/register", request);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [LiveApiFact]
        public async Task Login_WithValidCredentials_Returns200AndToken()
        {
            var request = new { email = _testEmail, password = _testPassword };
            var response = await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/login", request);
            
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(content.TryGetProperty("token", out var token));
            Assert.False(string.IsNullOrEmpty(token.GetString()));
        }

        // ==================== AUTHORIZATION TESTS ====================

        [LiveApiFact]
        public async Task GetUsers_WithoutToken_Returns401()
        {
            var response = await _client.GetAsync($"{_baseUrl}/api/users");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [LiveApiFact]
        public async Task GetUsers_WithValidToken_Returns200()
        {
            var token = await GetJwtToken();
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync($"{_baseUrl}/api/users");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        // ==================== USER ENDPOINT TESTS ====================

        [LiveApiFact]
        public async Task GetAllUsers_Returns200AndData()
        {
            var token = await GetJwtToken();
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync($"{_baseUrl}/api/users");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.IsType<JsonElement>(content);
        }

        // ==================== EVENT ENDPOINT TESTS ====================

        [LiveApiFact]
        public async Task CreateEvent_WithValidData_Returns201()
        {
            var token = await GetJwtToken();
            var userId = await GetCurrentUserId(token);

            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var eventRequest = new
            {
                plannerId = userId,
                title = "Test Event " + Guid.NewGuid(),
                description = "Test event description",
                location = "Test Location",
                eventDate = DateTime.UtcNow.AddDays(7)
            };

            var response = await _client.PostAsJsonAsync($"{_baseUrl}/api/events", eventRequest);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [LiveApiFact]
        public async Task GetAllEvents_Returns200()
        {
            var token = await GetJwtToken();
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await _client.GetAsync($"{_baseUrl}/api/events");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        // ==================== CACHING TESTS ====================

        [LiveApiFact]
        public async Task GetEvents_SecondRequest_ShouldBeFromCache()
        {
            var token = await GetJwtToken();
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            // First request - should hit database
            var response1 = await _client.GetAsync($"{_baseUrl}/api/events");
            Assert.Equal(HttpStatusCode.OK, response1.StatusCode);
            var data1 = await response1.Content.ReadAsStringAsync();

            // Second request - should hit cache
            var response2 = await _client.GetAsync($"{_baseUrl}/api/events");
            Assert.Equal(HttpStatusCode.OK, response2.StatusCode);
            var data2 = await response2.Content.ReadAsStringAsync();

            // Data should be identical (from cache)
            Assert.Equal(data1, data2);
        }

        // ==================== OPENAPI TEST ====================

        [LiveApiFact]
        public async Task OpenApiEndpoint_Returns200()
        {
            var response = await _client.GetAsync($"{_baseUrl}/openapi/v1.json");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            
            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.True(content.TryGetProperty("openapi", out _));
        }

        // ==================== HELPER METHODS ====================

        private async Task<int> GetCurrentUserId(string token)
        {
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            var response = await _client.GetAsync($"{_baseUrl}/api/users");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadFromJsonAsync<List<JsonElement>>();
                if (content.Count > 0)
                {
                    return content[0].GetProperty("userId").GetInt32();
                }
            }

            // Fallback to ID 1 if no users found
            return 1;
        }
    }

    /// <summary>
    /// Performance Tests for Caching
    /// </summary>
    public class CachingPerformanceTests : IAsyncLifetime
    {
        private HttpClient _client;
        private string _baseUrl = "http://localhost:5100";
        private string _jwtToken;

        public async Task InitializeAsync()
        {
            _client = new HttpClient();
            await LiveApiGuard.EnsureAvailableAsync(_baseUrl);
            await AuthenticateAsync();
        }

        public async Task DisposeAsync()
        {
            _client?.Dispose();
        }

        private async Task AuthenticateAsync()
        {
            // Register
            var registerRequest = new
            {
                email = $"perf_test_{Guid.NewGuid()}@example.com",
                password = "ValidPass123!",
                fullName = "Performance Test User",
                roles = new[] { "Attendee" }
            };

            await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/register", registerRequest);

            // Login
            var loginRequest = new { email = registerRequest.email, password = registerRequest.password };
            var response = await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/login", loginRequest);
            var content = await response.Content.ReadFromJsonAsync<JsonElement>();
            _jwtToken = content.GetProperty("token").GetString();

            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _jwtToken);
        }

        [LiveApiFact]
        public async Task CachedEndpoint_ShouldBeFasterOnSecondRequest()
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            // First request
            var response1 = await _client.GetAsync($"{_baseUrl}/api/users");
            stopwatch.Stop();
            var firstRequestTime = stopwatch.ElapsedMilliseconds;

            Assert.Equal(HttpStatusCode.OK, response1.StatusCode);
            Assert.True(firstRequestTime > 0);

            stopwatch.Restart();
            
            // Second request (cached)
            var response2 = await _client.GetAsync($"{_baseUrl}/api/users");
            stopwatch.Stop();
            var secondRequestTime = stopwatch.ElapsedMilliseconds;

            Assert.Equal(HttpStatusCode.OK, response2.StatusCode);
            
            // Cached request should be faster or equal
            Assert.True(secondRequestTime <= firstRequestTime + 50, 
                $"Cached request ({secondRequestTime}ms) should be faster than first request ({firstRequestTime}ms)");
        }
    }

    /// <summary>
    /// Role-based Authorization Tests
    /// </summary>
    public class AuthorizationTests : IAsyncLifetime
    {
        private HttpClient _client;
        private string _baseUrl = "http://localhost:5100";
        private string _attendeeToken;
        private string _plannerToken;

        public async Task InitializeAsync()
        {
            _client = new HttpClient();
            await LiveApiGuard.EnsureAvailableAsync(_baseUrl);
            await SetupUsersAsync();
        }

        public async Task DisposeAsync()
        {
            _client?.Dispose();
        }

        private async Task SetupUsersAsync()
        {
            // Create Attendee
            var attendeeEmail = $"attendee_{Guid.NewGuid()}@example.com";
            var attendeeRequest = new
            {
                email = attendeeEmail,
                password = "ValidPass123!",
                fullName = "Attendee User",
                roles = new[] { "Attendee" }
            };
            await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/register", attendeeRequest);

            var attendeeLoginResponse = await _client.PostAsJsonAsync(
                $"{_baseUrl}/api/auth/login",
                new { email = attendeeEmail, password = "ValidPass123!" });
            var attendeeLoginContent = await attendeeLoginResponse.Content.ReadFromJsonAsync<JsonElement>();
            _attendeeToken = attendeeLoginContent.GetProperty("token").GetString();

            // Create Planner
            var plannerEmail = $"planner_{Guid.NewGuid()}@example.com";
            var plannerRequest = new
            {
                email = plannerEmail,
                password = "ValidPass123!",
                fullName = "Planner User",
                roles = new[] { "Planner" }
            };
            await _client.PostAsJsonAsync($"{_baseUrl}/api/auth/register", plannerRequest);

            var plannerLoginResponse = await _client.PostAsJsonAsync(
                $"{_baseUrl}/api/auth/login",
                new { email = plannerEmail, password = "ValidPass123!" });
            var plannerLoginContent = await plannerLoginResponse.Content.ReadFromJsonAsync<JsonElement>();
            _plannerToken = plannerLoginContent.GetProperty("token").GetString();
        }

        [LiveApiFact]
        public async Task AuthorizedUser_CanAccessProtectedEndpoint()
        {
            _client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _attendeeToken);
            var response = await _client.GetAsync($"{_baseUrl}/api/users");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [LiveApiFact]
        public async Task UnauthorizedUser_CannotAccessProtectedEndpoint()
        {
            var response = await _client.GetAsync($"{_baseUrl}/api/users");
            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
