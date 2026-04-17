using Domain.Entities;
using Domain.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.SeedData
{
    public static class RoleSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // 🔥 Ensure seeding happens ONLY ONCE
            if (await context.Role.AnyAsync())
                return;

            var roles = new List<Role>
            {
                new Role { RoleName = "Planner" },
                new Role { RoleName = "Vendor" },
                new Role { RoleName = "Attendee" },
                new Role { RoleName = "ServiceProvider" }
            };

            await context.Role.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }
    }
}