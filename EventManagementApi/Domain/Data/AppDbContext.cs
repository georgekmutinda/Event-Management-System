using Microsoft.EntityFrameworkCore;
using Domain.Entities;


namespace Domain.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }
        

        // =========================
        // DBSets (ALL SINGULAR)
        // =========================
        public DbSet<User> User { get; set; }
        public DbSet<Role> Role { get; set; }
        public DbSet<UserRole> UserRole { get; set; }

        public DbSet<Event> Event { get; set; }
        public DbSet<EventRegistration> EventRegistration { get; set; }
        public DbSet<EventVendor> EventVendor { get; set; }
        public DbSet<EventService> EventService { get; set; }

        public DbSet<Vendor> Vendor { get; set; }
        public DbSet<ServiceProviderProfile> ServiceProviderProfile { get; set; }

        public DbSet<Payment> Payment { get; set; }
        public DbSet<Invitation> Invitation { get; set; }

        // =========================
        // MODEL CONFIGURATION
        // =========================
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        

            // =========================
            // USER
            // =========================
            modelBuilder.Entity<User>()
                .ToTable("User");

            modelBuilder.Entity<User>()
                .HasKey(u => u.UserId);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // =========================
            // ROLE
            // =========================
            modelBuilder.Entity<Role>()
                .ToTable("Role");

            modelBuilder.Entity<Role>()
                .HasKey(r => r.RoleId);

            // =========================
            // USER ROLE (MANY TO MANY)
            // =========================
            modelBuilder.Entity<UserRole>()
                .ToTable("UserRole");

            modelBuilder.Entity<UserRole>()
                .HasKey(ur => new { ur.UserId, ur.RoleId });

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(ur => ur.UserId);

            modelBuilder.Entity<UserRole>()
                .HasOne(ur => ur.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(ur => ur.RoleId);

            // =========================
            // EVENT
            // =========================
            modelBuilder.Entity<Event>()
                .ToTable("Event");

            modelBuilder.Entity<Event>()
                .HasKey(e => e.EventId);

            modelBuilder.Entity<Event>()
                .HasOne(e => e.Planner)
                .WithMany(u => u.EventsCreated)
                .HasForeignKey(e => e.PlannerId);

            // =========================
            // EVENT REGISTRATION
            // =========================
            modelBuilder.Entity<EventRegistration>()
                .ToTable("EventRegistration");

            modelBuilder.Entity<EventRegistration>()
                .HasKey(er => er.RegistrationId);

            modelBuilder.Entity<EventRegistration>()
                .HasOne(er => er.Event)
                .WithMany(e => e.Registrations)
                .HasForeignKey(er => er.EventId);

            modelBuilder.Entity<EventRegistration>()
                .HasOne(er => er.Attendee)
                .WithMany(u => u.Registrations)
                .HasForeignKey(er => er.AttendeeId);

            // Prevent duplicate registrations: unique constraint on (EventId, AttendeeId)
            modelBuilder.Entity<EventRegistration>()
                .HasIndex(r => new { r.EventId, r.AttendeeId })
                .IsUnique();

            // =========================
            // VENDOR
            // =========================
            modelBuilder.Entity<Vendor>()
                .ToTable("Vendor");

            modelBuilder.Entity<Vendor>()
                .HasKey(v => v.VendorId);

            modelBuilder.Entity<Vendor>()
                .HasOne(v => v.User)
                .WithMany()
                .HasForeignKey(v => v.UserId);

            // =========================
            // SERVICE PROVIDER
            // =========================
            modelBuilder.Entity<ServiceProviderProfile>()
                .ToTable("ServiceProviderProfile");

            modelBuilder.Entity<ServiceProviderProfile>()
                .HasKey(sp => sp.ProviderId);

            modelBuilder.Entity<ServiceProviderProfile>()
                .HasOne(sp => sp.User)
                .WithMany()
                .HasForeignKey(sp => sp.UserId);

            // =========================
            // EVENT VENDOR
            // =========================
            modelBuilder.Entity<EventVendor>()
                .ToTable("EventVendor");

            modelBuilder.Entity<EventVendor>()
                .HasKey(ev => ev.EventVendorId);

            modelBuilder.Entity<EventVendor>()
                .HasOne(ev => ev.Event)
                .WithMany(e => e.EventVendors)
                .HasForeignKey(ev => ev.EventId);

            modelBuilder.Entity<EventVendor>()
                .HasOne(ev => ev.Vendor)
                .WithMany(v => v.EventVendors)
                .HasForeignKey(ev => ev.VendorId);

            // Prevent duplicate associations: unique constraint on (EventId, VendorId)
            modelBuilder.Entity<EventVendor>()
                .HasIndex(ev => new { ev.EventId, ev.VendorId })
                .IsUnique();

            // =========================
            // EVENT SERVICE
            // =========================
            modelBuilder.Entity<EventService>()
                .ToTable("EventService");

            modelBuilder.Entity<EventService>()
                .HasKey(es => es.EventServiceId);

            modelBuilder.Entity<EventService>()
                .HasOne(es => es.Event)
                .WithMany(e => e.EventServices)
                .HasForeignKey(es => es.EventId);

            modelBuilder.Entity<EventService>()
                .HasOne(es => es.Provider)
                .WithMany(sp => sp.EventServices)
                .HasForeignKey(es => es.ProviderId);

            // =========================
            // PAYMENT
            // =========================
            modelBuilder.Entity<Payment>()
                .ToTable("Payment");

            modelBuilder.Entity<Payment>()
                .HasKey(p => p.PaymentId);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.User)
                .WithMany(u => u.Payments)
                .HasForeignKey(p => p.UserId);

            modelBuilder.Entity<Payment>()
                .HasOne(p => p.Event)
                .WithMany(e => e.Payments)
                .HasForeignKey(p => p.EventId);

            // =========================
            // INVITATION
            // =========================
            modelBuilder.Entity<Invitation>()
                .ToTable("Invitation");

            modelBuilder.Entity<Invitation>()
                .HasKey(i => i.InvitationId);

            modelBuilder.Entity<Invitation>()
                .HasOne(i => i.Event)
                .WithMany()
                .HasForeignKey(i => i.EventId)
                .IsRequired(false);

            modelBuilder.Entity<Invitation>()
                .HasOne(i => i.InvitedByUser)
                .WithMany()
                .HasForeignKey(i => i.InvitedByUserId);
        }
        
    }
    
}
