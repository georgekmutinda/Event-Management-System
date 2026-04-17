using Domain.Entities;
using Domain.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Infrastructure.SeedData
{
    /// <summary>
    /// Comprehensive seeder for populating the database with test data.
    /// Seeds roles, users, events, vendors, payments, and service providers.
    /// </summary>
    public static class ComprehensiveSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // Only seed if database is empty
            if (await context.User.AnyAsync() || await context.Event.AnyAsync())
                return;

            // Seed initial roles first (if not already seeded)
            await RoleSeeder.SeedAsync(context);

            var roles = await context.Role.ToListAsync();

            // ===== USERS =====
            var users = new List<User>
            {
                new User
                {
                    FullName = "Alice Johnson (Planner)",
                    Email = "alice.planner@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Bob Smith (Vendor)",
                    Email = "bob.vendor@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Carol Davis (Attendee)",
                    Email = "carol.attendee@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "David Wilson (ServiceProvider)",
                    Email = "david.provider@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                },
                new User
                {
                    FullName = "Emma Brown (Vendor)",
                    Email = "emma.vendor@example.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("SecurePassword123!")
                }
            };

            await context.User.AddRangeAsync(users);
            await context.SaveChangesAsync();

            // Reload users to get their IDs
            users = await context.User.ToListAsync();

            // ===== USER ROLES =====
            var userRoles = new List<UserRole>
            {
                new UserRole { UserId = users[0].UserId, RoleId = roles.First(r => r.RoleName == "Planner").RoleId },
                new UserRole { UserId = users[1].UserId, RoleId = roles.First(r => r.RoleName == "Vendor").RoleId },
                new UserRole { UserId = users[2].UserId, RoleId = roles.First(r => r.RoleName == "Attendee").RoleId },
                new UserRole { UserId = users[3].UserId, RoleId = roles.First(r => r.RoleName == "ServiceProvider").RoleId },
                new UserRole { UserId = users[4].UserId, RoleId = roles.First(r => r.RoleName == "Vendor").RoleId }
            };

            await context.UserRole.AddRangeAsync(userRoles);
            await context.SaveChangesAsync();

            // ===== EVENTS =====
            var events = new List<Event>
            {
                new Event
                {
                    PlannerId = users[0].UserId, // Alice (Planner)
                    Title = "Tech Conference 2026",
                    Description = "The largest technology conference of the year",
                    Location = "San Francisco Convention Center",
                    EventDate = DateTime.UtcNow.AddMonths(3),
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    PlannerId = users[0].UserId, // Alice (Planner)
                    Title = "Summer Music Festival",
                    Description = "Outdoor music festival with multiple stages",
                    Location = "Central Park",
                    EventDate = DateTime.UtcNow.AddMonths(2),
                    CreatedAt = DateTime.UtcNow
                },
                new Event
                {
                    PlannerId = users[0].UserId, // Alice (Planner)
                    Title = "Business Networking Lunch",
                    Description = "Exclusive networking event for professionals",
                    Location = "Downtown Hilton",
                    EventDate = DateTime.UtcNow.AddDays(30),
                    CreatedAt = DateTime.UtcNow
                }
            };

            await context.Event.AddRangeAsync(events);
            await context.SaveChangesAsync();

            // Reload events
            events = await context.Event.ToListAsync();

            // ===== VENDORS =====
            var vendors = new List<Vendor>
            {
                new Vendor
                {
                    UserId = users[1].UserId, // Bob (Vendor)
                    BusinessName = "Gourmet Catering Co.",
                    ProductType = "Catering",
                    Description = "Premium catering services for all events"
                },
                new Vendor
                {
                    UserId = users[4].UserId, // Emma (Vendor)
                    BusinessName = "ProPhoto Studio",
                    ProductType = "Photography",
                    Description = "Professional photography and videography"
                }
            };

            await context.Vendor.AddRangeAsync(vendors);
            await context.SaveChangesAsync();

            // Reload vendors
            vendors = await context.Vendor.ToListAsync();

            // ===== SERVICE PROVIDERS =====
            var serviceProviders = new List<ServiceProviderProfile>
            {
                new ServiceProviderProfile
                {
                    UserId = users[3].UserId, // David (ServiceProvider)
                    ServiceType = "Audio/Visual Equipment",
                    CompanyName = "SoundTech Solutions",
                    Description = "State-of-the-art AV equipment rental and technical support"
                },
                new ServiceProviderProfile
                {
                    UserId = users[1].UserId, // Bob also has a service profile
                    ServiceType = "Event Decoration",
                    CompanyName = "DecorArt Events",
                    Description = "Elegant and creative event decoration"
                }
            };

            await context.ServiceProviderProfile.AddRangeAsync(serviceProviders);
            await context.SaveChangesAsync();

            // Reload service providers
            serviceProviders = await context.ServiceProviderProfile.ToListAsync();

            // ===== EVENT REGISTRATIONS =====
            var registrations = new List<EventRegistration>
            {
                new EventRegistration
                {
                    EventId = events[0].EventId,
                    AttendeeId = users[2].UserId, // Carol (Attendee)
                    TicketType = "VIP",
                    PaymentStatus = "Pending",
                    RegisteredAt = DateTime.UtcNow
                },
                new EventRegistration
                {
                    EventId = events[1].EventId,
                    AttendeeId = users[2].UserId, // Carol (Attendee)
                    TicketType = "General",
                    PaymentStatus = "Pending",
                    RegisteredAt = DateTime.UtcNow
                }
            };

            await context.EventRegistration.AddRangeAsync(registrations);
            await context.SaveChangesAsync();

            // ===== EVENT VENDORS =====
            var eventVendors = new List<EventVendor>
            {
                new EventVendor
                {
                    EventId = events[0].EventId,
                    VendorId = vendors[0].VendorId, // Gourmet Catering
                    Status = "Confirmed"
                },
                new EventVendor
                {
                    EventId = events[0].EventId,
                    VendorId = vendors[1].VendorId, // ProPhoto Studio
                    Status = "Pending"
                },
                new EventVendor
                {
                    EventId = events[1].EventId,
                    VendorId = vendors[0].VendorId, // Gourmet Catering
                    Status = "Confirmed"
                }
            };

            await context.EventVendor.AddRangeAsync(eventVendors);
            await context.SaveChangesAsync();

            // ===== EVENT SERVICES =====
            var eventServices = new List<EventService>
            {
                new EventService
                {
                    EventId = events[0].EventId,
                    ProviderId = serviceProviders[0].ProviderId, // SoundTech Solutions
                    ServiceDetails = "Complete AV setup including projectors, microphones, and sound system",
                    Status = "Pending"
                },
                new EventService
                {
                    EventId = events[0].EventId,
                    ProviderId = serviceProviders[1].ProviderId, // DecorArt Events
                    ServiceDetails = "Stage decoration and ambient lighting",
                    Status = "Confirmed"
                },
                new EventService
                {
                    EventId = events[1].EventId,
                    ProviderId = serviceProviders[0].ProviderId, // SoundTech Solutions
                    ServiceDetails = "Outdoor sound system and stage lights",
                    Status = "Pending"
                }
            };

            await context.EventService.AddRangeAsync(eventServices);
            await context.SaveChangesAsync();

            // ===== PAYMENTS =====
            var payments = new List<Payment>
            {
                new Payment
                {
                    UserId = users[2].UserId, // Carol (Attendee)
                    EventId = events[0].EventId,
                    Amount = 299.99m,
                    PaymentStatus = "Completed",
                    PaymentDate = DateTime.UtcNow
                },
                new Payment
                {
                    UserId = users[2].UserId, // Carol (Attendee)
                    EventId = events[1].EventId,
                    Amount = 149.99m,
                    PaymentStatus = "Pending",
                    PaymentDate = DateTime.UtcNow.AddDays(-5)
                }
            };

            await context.Payment.AddRangeAsync(payments);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Comprehensive database seeding completed successfully!");
        }
    }
}
