# Entity Framework Core - Naming Conventions & Best Practices

## Overview
This document outlines the naming conventions applied across the Event Management System to ensure consistency, maintainability, and adherence to Entity Framework Core standards.

---

## 1. Class Naming Convention

### Rule: **SINGULAR**
All entity class names must be **singular** to represent a single entity instance.

### Examples:
```csharp
public class User          // ✓ Correct
public class Users         // ✗ Wrong

public class Role          // ✓ Correct
public class Roles         // ✗ Wrong

public class Event         // ✓ Correct
public class Events        // ✗ Wrong

public class Payment       // ✓ Correct
public class Payments      // ✗ Wrong
```

### Why?
- A class represents the **blueprint for a single entity**
- Naming is singular to reflect what each instance represents
- Follows C# and OOP conventions

---

## 2. DbSet Naming Convention

### Rule: **PLURAL**
All `DbSet<T>` properties in `AppDbContext` must be **plural** to represent a collection of entities.

### Examples:
```csharp
public DbSet<User> Users                           // ✓ Correct
public DbSet<User> User                            // ✗ Wrong

public DbSet<Role> Roles                           // ✓ Correct
public DbSet<Role> Role                            // ✗ Wrong

public DbSet<EventRegistration> EventRegistrations // ✓ Correct
public DbSet<EventRegistration> EventRegistration  // ✗ Wrong
```

### Why?
- `DbSet<T>` represents a **collection of entities** in the database table
- Plural naming clearly indicates it's a collection
- Improves readability: `context.Users.Where(...)` vs `context.User.Where(...)`

---

## 3. Foreign Key Reference Properties

### Rule: **SINGULAR**
Navigation properties that reference a **single entity** (many-to-one or one-to-one relationships) must be **singular**.

### Examples:

#### User → Role (Many-to-One)
```csharp
public class UserRole
{
    public int RoleId { get; set; }
    public Role Role { get; set; }        // ✓ Correct - singular, references one Role
    
    public int UserId { get; set; }
    public User User { get; set; }        // ✓ Correct - singular, references one User
}
```

#### Event → User (Many-to-One)
```csharp
public class Event
{
    public int PlannerId { get; set; }
    public User Planner { get; set; }     // ✓ Correct - singular, references one User
}
```

#### Payment → User & Event (Many-to-One)
```csharp
public class Payment
{
    public int UserId { get; set; }
    public User User { get; set; }        // ✓ Correct - singular
    
    public int EventId { get; set; }
    public Event Event { get; set; }      // ✓ Correct - singular
}
```

### Why?
- Singular naming clearly indicates a **single entity reference**
- Makes code more readable: `payment.User.Email` vs `payment.Users.Email`
- Semantically correct: "A payment belongs to a User" (singular)

---

## 4. Collection Navigation Properties

### Rule: **PLURAL**
Navigation properties that represent **multiple entities** (one-to-many or many-to-many relationships) must be **plural**.

### Examples:

#### User → Multiple Roles
```csharp
public class User
{
    public int UserId { get; set; }
    public string FullName { get; set; }
    
    // Collection properties - PLURAL
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Event> EventsCreated { get; set; } = new List<Event>();
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
```

#### Event → Multiple Registrations
```csharp
public class Event
{
    public int EventId { get; set; }
    public string Title { get; set; }
    
    // Collection properties - PLURAL
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<EventVendor> EventVendors { get; set; } = new List<EventVendor>();
    public ICollection<EventService> EventServices { get; set; } = new List<EventService>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
```

#### Role → Multiple UserRoles
```csharp
public class Role
{
    public int RoleId { get; set; }
    public string RoleName { get; set; }
    
    // Collection property - PLURAL
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
```

### Why?
- Plural naming clearly indicates a **collection of entities**
- Improves code readability: `user.Registrations.Count()` vs `user.Registration.Count()`
- Semantically correct: "A user has many Registrations" (plural)
- Easier to understand the cardinality of the relationship

---

## 5. Collection Initialization

### Rule: **Always Initialize with `new List<ClassName>()`**
Collection navigation properties must be initialized in the class definition to prevent null reference exceptions.

### Examples:
```csharp
public class User
{
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Event> EventsCreated { get; set; } = new List<Event>();
}

public class Role
{
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

public class Event
{
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<EventVendor> EventVendors { get; set; } = new List<EventVendor>();
}
```

### Why?
- Prevents null reference exceptions when accessing collections
- Collections are immediately available for use
- Follows Entity Framework Core best practices
- Allows safe iteration without null checks

---

## 6. Foreign Key Naming

### Rule: **Match Navigation Property Name + "Id"**
Foreign key properties should follow the pattern: `{NavigationPropertyName}Id`

### Examples:
```csharp
public class Event
{
    public int PlannerId { get; set; }    // FK - matches "Planner" navigation
    public User Planner { get; set; }     // Navigation property
}

public class UserRole
{
    public int UserId { get; set; }       // FK - matches "User" navigation
    public User User { get; set; }        // Navigation property
    
    public int RoleId { get; set; }       // FK - matches "Role" navigation
    public Role Role { get; set; }        // Navigation property
}

public class Payment
{
    public int UserId { get; set; }       // FK - matches "User" navigation
    public User User { get; set; }        // Navigation property
    
    public int EventId { get; set; }      // FK - matches "Event" navigation
    public Event Event { get; set; }      // Navigation property
}
```

### Why?
- Clear association between FK and navigation property
- Entity Framework can automatically detect relationships
- Makes database schema intuitive to understand

---

## 7. Complete Example

### User Entity
```csharp
public class User
{
    // Primary Key
    public int UserId { get; set; }
    
    // Properties
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    
    // Navigation Properties - Collections (Plural)
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Event> EventsCreated { get; set; } = new List<Event>();
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
```

### Role Entity
```csharp
public class Role
{
    // Primary Key
    public int RoleId { get; set; }
    
    // Properties
    public string RoleName { get; set; }
    
    // Navigation Property - Collection (Plural)
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
```

### UserRole Entity (Join Table)
```csharp
public class UserRole
{
    // Foreign Keys
    public int UserId { get; set; }
    public int RoleId { get; set; }
    
    // Navigation Properties - Single References (Singular)
    public User User { get; set; }
    public Role Role { get; set; }
}
```

### Event Entity
```csharp
public class Event
{
    // Primary Key
    public int EventId { get; set; }
    
    // Foreign Key
    public int PlannerId { get; set; }
    
    // Properties
    public string Title { get; set; }
    public string Description { get; set; }
    public string Location { get; set; }
    public DateTime EventDate { get; set; }
    public DateTime CreatedAt { get; set; }
    
    // Navigation Property - Single Reference (Singular)
    public User Planner { get; set; }
    
    // Navigation Properties - Collections (Plural)
    public ICollection<EventRegistration> Registrations { get; set; } = new List<EventRegistration>();
    public ICollection<EventVendor> EventVendors { get; set; } = new List<EventVendor>();
    public ICollection<EventService> EventServices { get; set; } = new List<EventService>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
```

---

## 8. DbContext Configuration Example

```csharp
public class AppDbContext : DbContext
{
    // DbSets - All PLURAL
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Event> Events { get; set; }
    public DbSet<EventRegistration> EventRegistrations { get; set; }
    public DbSet<EventVendor> EventVendors { get; set; }
    public DbSet<EventService> EventServices { get; set; }
    public DbSet<Vendor> Vendors { get; set; }
    public DbSet<ServiceProviderProfile> ServiceProviders { get; set; }
    public DbSet<Payment> Payments { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User - Role (Many-to-Many)
        modelBuilder.Entity<UserRole>()
            .HasKey(ur => new { ur.UserId, ur.RoleId });
        
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User)                // Single User
            .WithMany(u => u.UserRoles)          // Multiple UserRoles
            .HasForeignKey(ur => ur.UserId);
        
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role)                // Single Role
            .WithMany(r => r.UserRoles)          // Multiple UserRoles
            .HasForeignKey(ur => ur.RoleId);
    }
}
```

---

## Summary Table

| **Context** | **Rule** | **Example** |
|---|---|---|
| Entity Class | Singular | `User`, `Role`, `Event` |
| DbSet Property | Plural | `DbSet<User> Users` |
| FK Reference (Single) | Singular | `public User User { get; set; }` |
| Collection Navigation | Plural | `public ICollection<UserRole> UserRoles { get; set; }` |
| Foreign Key Column | Singular + Id | `public int UserId { get; set; }` |
| Collection Initialization | List | `= new List<UserRole>()` |

---

## References
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [EF Core Modeling Relationships](https://learn.microsoft.com/en-us/ef/core/modeling/relationships)
- [C# Naming Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/naming-conventions)

---

## When to Apply These Rules

✓ **Always apply these conventions:**
- When creating new entity classes
- When adding navigation properties
- When creating DbSet properties in DbContext
- When refactoring existing code

✓ **Be consistent:**
- Ensure all entities follow the same pattern
- Keep pluralization consistent across the project
- Document any exceptions and why they exist

---

Last Updated: April 14, 2026
