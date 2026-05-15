using Domain.Entities;
using Domain.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.SeedData
{
    public static class ComprehensiveSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            var hasCoreData =
                await context.User.AnyAsync() ||
                await context.Event.AnyAsync() ||
                await context.Vendor.AnyAsync() ||
                await context.ServiceProviderProfile.AnyAsync() ||
                await context.Payment.AnyAsync();

            await RoleSeeder.SeedAsync(context);
            var roles = await context.Role.ToListAsync();

            if (!hasCoreData)
            {
                var users = new List<User>
                {
                    new() { FullName = "Alice Johnson", Email = "alice.planner@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!") },
                    new() { FullName = "Bob Smith", Email = "bob.vendor@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!") },
                    new() { FullName = "Carol Davis", Email = "carol.attendee@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!") },
                    new() { FullName = "David Wilson", Email = "david.provider@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!") },
                    new() { FullName = "Emma Brown", Email = "emma.vendor@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!") },
                    new() { FullName = "Admin User", Email = "admin@eventara.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!") }
                };

                await context.User.AddRangeAsync(users);
                await context.SaveChangesAsync();
                users = await context.User.ToListAsync();

                var userRoles = new List<UserRole>
                {
                    new() { UserId = users.First(u => u.Email == "alice.planner@example.com").UserId, RoleId = roles.First(r => r.RoleName == "Planner").RoleId },
                    new() { UserId = users.First(u => u.Email == "bob.vendor@example.com").UserId, RoleId = roles.First(r => r.RoleName == "Vendor").RoleId },
                    new() { UserId = users.First(u => u.Email == "carol.attendee@example.com").UserId, RoleId = roles.First(r => r.RoleName == "Attendee").RoleId },
                    new() { UserId = users.First(u => u.Email == "david.provider@example.com").UserId, RoleId = roles.First(r => r.RoleName == "ServiceProvider").RoleId },
                    new() { UserId = users.First(u => u.Email == "emma.vendor@example.com").UserId, RoleId = roles.First(r => r.RoleName == "Vendor").RoleId },
                    new() { UserId = users.First(u => u.Email == "admin@eventara.com").UserId, RoleId = roles.First(r => r.RoleName == "Admin").RoleId }
                };

                await context.UserRole.AddRangeAsync(userRoles);
                await context.SaveChangesAsync();

                users = await context.User.ToListAsync();
                var alice = users.First(u => u.Email == "alice.planner@example.com");

                var events = new List<Event>
                {
                    new() { PlannerId = alice.UserId, Title = "Tech Conference 2026", Description = "The largest technology conference of the year", Location = "San Francisco Convention Center", TicketPrice = 4500m, EventDate = DateTime.UtcNow.AddMonths(3), CreatedAt = DateTime.UtcNow },
                    new() { PlannerId = alice.UserId, Title = "Summer Music Festival", Description = "Outdoor music festival with multiple stages", Location = "Central Park", TicketPrice = 15000m, EventDate = DateTime.UtcNow.AddMonths(2), CreatedAt = DateTime.UtcNow },
                    new() { PlannerId = alice.UserId, Title = "Business Networking Lunch", Description = "Exclusive networking event for professionals", Location = "Downtown Hilton", TicketPrice = 2500m, EventDate = DateTime.UtcNow.AddDays(30), CreatedAt = DateTime.UtcNow }
                };

                await context.Event.AddRangeAsync(events);
                await context.SaveChangesAsync();
                events = await context.Event.ToListAsync();

                var bob = users.First(u => u.Email == "bob.vendor@example.com");
                var emma = users.First(u => u.Email == "emma.vendor@example.com");
                var vendors = new List<Vendor>
                {
                    new()
                    {
                        UserId = bob.UserId,
                        BusinessName = "Gourmet Catering Co.",
                        ProductType = "Catering",
                        Description = "Premium catering services for all events",
                        PhotoUrl = "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
                        AverageRating = 4.8m,
                        TotalReviews = 24,
                        Recommendations = "Beautiful presentation and reliable timing.\nExcellent menu planning for corporate events."
                    },
                    new()
                    {
                        UserId = emma.UserId,
                        BusinessName = "ProPhoto Studio",
                        ProductType = "Photography",
                        Description = "Professional photography and videography",
                        PhotoUrl = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
                        AverageRating = 4.6m,
                        TotalReviews = 18,
                        Recommendations = "Strong event coverage with polished editing.\nGreat at capturing candid guest moments."
                    }
                };

                await context.Vendor.AddRangeAsync(vendors);
                await context.SaveChangesAsync();
                vendors = await context.Vendor.ToListAsync();

                var david = users.First(u => u.Email == "david.provider@example.com");
                var serviceProviders = new List<ServiceProviderProfile>
                {
                    new() { UserId = david.UserId, ServiceType = "Audio/Visual Equipment", CompanyName = "SoundTech Solutions", Description = "State-of-the-art AV equipment rental and technical support" },
                    new() { UserId = bob.UserId, ServiceType = "Event Decoration", CompanyName = "DecorArt Events", Description = "Elegant and creative event decoration" }
                };

                await context.ServiceProviderProfile.AddRangeAsync(serviceProviders);
                await context.SaveChangesAsync();
                serviceProviders = await context.ServiceProviderProfile.ToListAsync();

                var carol = users.First(u => u.Email == "carol.attendee@example.com");
                var registrations = new List<EventRegistration>
                {
                    new() { EventId = events[0].EventId, AttendeeId = carol.UserId, TicketType = "VIP", PaymentStatus = "Completed", RegisteredAt = DateTime.UtcNow },
                    new() { EventId = events[1].EventId, AttendeeId = carol.UserId, TicketType = "General", PaymentStatus = "Pending", RegisteredAt = DateTime.UtcNow }
                };

                await context.EventRegistration.AddRangeAsync(registrations);
                await context.SaveChangesAsync();

                var eventVendors = new List<EventVendor>
                {
                    new() { EventId = events[0].EventId, VendorId = vendors[0].VendorId, Status = "Confirmed" },
                    new() { EventId = events[0].EventId, VendorId = vendors[1].VendorId, Status = "Pending" },
                    new() { EventId = events[1].EventId, VendorId = vendors[0].VendorId, Status = "Confirmed" }
                };

                await context.EventVendor.AddRangeAsync(eventVendors);
                await context.SaveChangesAsync();

                var eventServices = new List<EventService>
                {
                    new() { EventId = events[0].EventId, ProviderId = serviceProviders[0].ProviderId, ServiceDetails = "Complete AV setup including projectors, microphones, and sound system", Status = "Pending" },
                    new() { EventId = events[0].EventId, ProviderId = serviceProviders[1].ProviderId, ServiceDetails = "Stage decoration and ambient lighting", Status = "Confirmed" },
                    new() { EventId = events[1].EventId, ProviderId = serviceProviders[0].ProviderId, ServiceDetails = "Outdoor sound system and stage lights", Status = "Pending" }
                };

                await context.EventService.AddRangeAsync(eventServices);
                await context.SaveChangesAsync();

                var payments = new List<Payment>
                {
                    new() { UserId = carol.UserId, EventId = events[0].EventId, Amount = events[0].TicketPrice, PaymentStatus = "Completed", PaymentDate = DateTime.UtcNow },
                    new() { UserId = carol.UserId, EventId = events[1].EventId, Amount = events[1].TicketPrice, PaymentStatus = "Pending", PaymentDate = DateTime.UtcNow.AddDays(-5) }
                };

                await context.Payment.AddRangeAsync(payments);
                await context.SaveChangesAsync();
            }

            if (!await context.PaymentCodes.AnyAsync())
            {
                var events = await context.Event.OrderBy(item => item.EventDate).ToListAsync();
                if (events.Count > 0)
                {
                    var codes = events.Take(3).Select((evt, index) => new PaymentCode
                    {
                        Code = $"EVT-2026-{(index + 1):D3}",
                        Amount = evt.TicketPrice,
                        EventId = evt.EventId,
                        EventName = evt.Title,
                        CreatedAt = DateTime.UtcNow
                    }).ToList();

                    await context.PaymentCodes.AddRangeAsync(codes);
                    await context.SaveChangesAsync();
                }
            }

            Console.WriteLine("Comprehensive database seeding completed successfully.");
        }
    }
}
