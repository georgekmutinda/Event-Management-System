using Domain.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace EventManagementApi.Tests
{
    /// <summary>
    /// Custom WebApplicationFactory for integration tests.
    /// Configures the app to use in-memory database instead of PostgreSQL.
    /// </summary>
    public class TestWebApplicationFactory : WebApplicationFactory<Program>
    {
        private readonly string _dbName = $"TestDb_{Guid.NewGuid()}";

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Set environment to "Test" FIRST to skip migrations in Program.cs
            builder.UseEnvironment("Test");

            // Configure services - this is called before the app is fully built
            builder.ConfigureServices(services =>
            {
                // Find and remove the existing DbContext registrations
                var toRemove = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                                d.ServiceType == typeof(DbContextOptions))
                    .ToList();

                foreach (var descriptor in toRemove)
                {
                    services.Remove(descriptor);
                }

                // Add the in-memory database provider with unique name per test
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseInMemoryDatabase(_dbName);
                }, ServiceLifetime.Scoped);
            });

            base.ConfigureWebHost(builder);
        }

        /// <summary>
        /// Helper method to reset the database between tests if needed
        /// </summary>
        public async Task ResetDatabaseAsync()
        {
            using (var scope = Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await context.Database.EnsureDeletedAsync();
                await context.Database.EnsureCreatedAsync();
            }
        }
    }
}


