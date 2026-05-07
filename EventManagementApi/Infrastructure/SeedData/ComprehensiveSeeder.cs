using Domain.Entities;
using Domain.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Infrastructure.SeedData
{
    public static class ComprehensiveSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (
                await context.User.AnyAsync() ||
                await context.Event.AnyAsync() ||
                await context.Vendor.AnyAsync() ||
                await context.ServiceProviderProfile.AnyAsync() ||
                await context.Payment.AnyAsync()
            )
                return;

            await RoleSeeder.SeedAsync(context);

            var roles = await context.Role.ToListAsync();

            // ===== USERS =====
            var users = new List<User>
            {
                new User
                {
                    FullName = "Alice Johnson",
                    Email = "alice.planner@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Bob Smith",
                    Email = "bob.vendor@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Carol Davis",
                    Email = "carol.attendee@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "David Wilson",
                    Email = "david.provider@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Emma Brown",
                    Email = "emma.vendor@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Admin User",
                    Email = "admin@eventara.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                }
            };

            await context.User.AddRangeAsync(users);
            await context.SaveChangesAsync();

            users = await context.User.ToListAsync();

            // ===== USER ROLES =====
            var userRoles = new List<UserRole>
            {
                new UserRole { UserId = users.First(u => u.Email == "alice.planner@example.com").UserId, RoleId = roles.First(r => r.RoleName == "Planner").RoleId },
                new UserRole { UserId = users.First(u => u.Email == "bob.vendor@example.com").UserId,    RoleId = roles.First(r => r.RoleName == "Vendor").RoleId },
                new UserRole { UserId = users.First(u => u.Email == "carol.attendee@example.com").UserId, RoleId = roles.First(r => r.RoleName == "Attendee").RoleId },
                new UserRole { UserId = users.First(u => u.Email == "david.provider@example.com").UserId, RoleId = roles.First(r => r.RoleName == "ServiceProvider").RoleId },
                new UserRole { UserId = users.First(u => u.Email == "emma.vendor@example.com").UserId,   RoleId = roles.First(r => r.RoleName == "Vendor").RoleId },
                new UserRole { UserId = users.First(u => u.Email == "admin@eventara.com").UserId,        RoleId = roles.First(r => r.RoleName == "Admin").RoleId }
            };

            await context.UserRole.AddRangeAsync(userRoles);
            await context.SaveChangesAsync();

            // Reload with correct IDs
            users = await context.User.ToListAsync();
            var alice = users.First(u => u.Email == "alice.planner@example.com");

            // ===== EVENTS =====
            var events = new List<Event>
            {
                new Event
                {
                    PlannerId  = alice.UserId,
                    Title      = "Tech Conference 2026",
                    Description = "The largest technology conference of the year",
                    Location   = "San Francisco Convention Center",
                    EventDate  = DateTime.UtcNow.AddMonths(3),
                    CreatedAt  = DateTime.UtcNow
                },
                new Event
                {
                    PlannerId  = alice.UserId,
                    Title      = "Summer Music Festival",
                    Description = "Outdoor music festival with multiple stages",
                    Location   = "Central Park",
                    EventDate  = DateTime.UtcNow.AddMonths(2),
                    CreatedAt  = DateTime.UtcNow
                },
                new Event
                {
                    PlannerId  = alice.UserId,
                    Title      = "Business Networking Lunch",
                    Description = "Exclusive networking event for professionals",
                    Location   = "Downtown Hilton",
                    EventDate  = DateTime.UtcNow.AddDays(30),
                    CreatedAt  = DateTime.UtcNow
                }
            };

            await context.Event.AddRangeAsync(events);
            await context.SaveChangesAsync();

            events = await context.Event.ToListAsync();

            // ===== VENDORS =====
            var bob  = users.First(u => u.Email == "bob.vendor@example.com");
            var emma = users.First(u => u.Email == "emma.vendor@example.com");

            var vendors = new List<Vendor>
            {
                new Vendor { UserId = bob.UserId,  BusinessName = "Gourmet Catering Co.", ProductType = "Catering",     Description = "Premium catering services for all events" },
                new Vendor { UserId = emma.UserId, BusinessName = "ProPhoto Studio",       ProductType = "Photography",  Description = "Professional photography and videography" }
            };

            await context.Vendor.AddRangeAsync(vendors);
            await context.SaveChangesAsync();

            vendors = await context.Vendor.ToListAsync();

            // ===== SERVICE PROVIDERS =====
            var david = users.First(u => u.Email == "david.provider@example.com");

            var serviceProviders = new List<ServiceProviderProfile>
            {
                new ServiceProviderProfile { UserId = david.UserId, ServiceType = "Audio/Visual Equipment", CompanyName = "SoundTech Solutions", Description = "State-of-the-art AV equipment rental and technical support" },
                new ServiceProviderProfile { UserId = bob.UserId,   ServiceType = "Event Decoration",       CompanyName = "DecorArt Events",     Description = "Elegant and creative event decoration" }
            };

            await context.ServiceProviderProfile.AddRangeAsync(serviceProviders);
            await context.SaveChangesAsync();

            serviceProviders = await context.ServiceProviderProfile.ToListAsync();

            var carol = users.First(u => u.Email == "carol.attendee@example.com");

            // ===== EVENT REGISTRATIONS =====
            var registrations = new List<EventRegistration>
            {
                new EventRegistration { EventId = events[0].EventId, AttendeeId = carol.UserId, TicketType = "VIP",     PaymentStatus = "Pending",   RegisteredAt = DateTime.UtcNow },
                new EventRegistration { EventId = events[1].EventId, AttendeeId = carol.UserId, TicketType = "General", PaymentStatus = "Pending",   RegisteredAt = DateTime.UtcNow }
            };

            await context.EventRegistration.AddRangeAsync(registrations);
            await context.SaveChangesAsync();

            // ===== EVENT VENDORS =====
            var eventVendors = new List<EventVendor>
            {
                new EventVendor { EventId = events[0].EventId, VendorId = vendors[0].VendorId, Status = "Confirmed" },
                new EventVendor { EventId = events[0].EventId, VendorId = vendors[1].VendorId, Status = "Pending"   },
                new EventVendor { EventId = events[1].EventId, VendorId = vendors[0].VendorId, Status = "Confirmed" }
            };

            await context.EventVendor.AddRangeAsync(eventVendors);
            await context.SaveChangesAsync();

            // ===== EVENT SERVICES =====
            var eventServices = new List<EventService>
            {
                new EventService { EventId = events[0].EventId, ProviderId = serviceProviders[0].ProviderId, ServiceDetails = "Complete AV setup including projectors, microphones, and sound system", Status = "Pending"   },
                new EventService { EventId = events[0].EventId, ProviderId = serviceProviders[1].ProviderId, ServiceDetails = "Stage decoration and ambient lighting",                                  Status = "Confirmed" },
                new EventService { EventId = events[1].EventId, ProviderId = serviceProviders[0].ProviderId, ServiceDetails = "Outdoor sound system and stage lights",                                  Status = "Pending"   }
            };

            await context.EventService.AddRangeAsync(eventServices);
            await context.SaveChangesAsync();

            // ===== PAYMENTS =====
            var payments = new List<Payment>
            {
                new Payment { UserId = carol.UserId, EventId = events[0].EventId, Amount = 299.99m, PaymentStatus = "Completed", PaymentDate = DateTime.UtcNow },
                new Payment { UserId = carol.UserId, EventId = events[1].EventId, Amount = 149.99m, PaymentStatus = "Pending",   PaymentDate = DateTime.UtcNow.AddDays(-5) }
            };

            await context.Payment.AddRangeAsync(payments);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Comprehensive database seeding completed successfully!");
        }
    }
}