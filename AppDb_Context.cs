using Microsoft.EntityFrameworkCore;
using EventSecurityAPI.Models;

namespace EventSecurityAPI.Data;

public class AppDbContext : DbContext{

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}
    public DbSet<User> Users { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventRegistration> EventRegistrations { get; set; }
    public DbSet<Payment> Payments { get; set; }

}
