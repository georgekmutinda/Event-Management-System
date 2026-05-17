using Application.Interfaces;
using Application.Services;
using Domain.Data;
using Infrastructure.Interfaces;
using Infrastructure.Repositories;
using Infrastructure.SeedData;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;
using Microsoft.ML;
using EventManagementApi.Security.Models;
using EventManagementApi.Security.Middleware;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter your JWT token. Example: Bearer eyJhbGciOiJIUzI1NiIs..."
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document, null),
            new List<string>()
        }
    });
});
builder.Services.AddHttpContextAccessor();

builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", policy =>
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connString)
        .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
});

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEventService, EventService>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IEventRegistrationService, EventRegistrationService>();
builder.Services.AddScoped<IEventRegistrationRepository, EventRegistrationRepository>();
builder.Services.AddScoped<IVendorService, VendorService>();
builder.Services.AddScoped<IVendorRepository, VendorRepository>();
builder.Services.AddScoped<IEventVendorService, EventVendorService>();
builder.Services.AddScoped<IEventVendorRepository, EventVendorRepository>();
builder.Services.AddScoped<IServiceProviderService, ServiceProviderService>();
builder.Services.AddScoped<IServiceProviderRepository, ServiceProviderRepository>();
builder.Services.AddScoped<IEventServiceService, EventServiceService>();
builder.Services.AddScoped<IEventServiceRepository, EventServiceRepository>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IInvitationService, InvitationService>();
builder.Services.AddScoped<IInvitationRepository, InvitationRepository>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<JwtTokenService>();

var rabbitMqHost = builder.Configuration["RabbitMQ:HostName"] ?? "localhost";
builder.Services.AddSingleton(sp => new RabbitMqService(rabbitMqHost));
builder.Services.AddScoped<IRabbitMqService>(sp => sp.GetRequiredService<RabbitMqService>());

var redisConnection = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
builder.Services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));
builder.Services.AddScoped<ICacheService, CacheService>();

builder.Services.AddAutoMapper(typeof(Application.Mappings.MappingProfile));

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = jwtSettings.GetValue<string>("Key")
    ?? throw new InvalidOperationException("JWT Key missing.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddSingleton<PredictionEngine<SqlData, SqlPrediction>>(serviceProvider =>
{
    var mlContext = new MLContext();

    var trainData = new List<SqlData>
    {
        new SqlData { ContainsOr = 0, ContainsUnion = 0, ContainsComment = 0, QuoteCount = 0, QueryLength = 30, Label = false },
        new SqlData { ContainsOr = 1, ContainsUnion = 0, ContainsComment = 1, QuoteCount = 2, QueryLength = 15, Label = true }
    };

    var data = mlContext.Data.LoadFromEnumerable(trainData);

    var pipeline = mlContext.Transforms
        .Concatenate("Features", "ContainsOr", "ContainsUnion", "ContainsComment", "QuoteCount", "QueryLength")
        .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression());

    var model = pipeline.Fit(data);

    return mlContext.Model.CreatePredictionEngine<SqlData, SqlPrediction>(model);
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await db.Database.ExecuteSqlRawAsync("""
        CREATE TABLE IF NOT EXISTS "BroadcastMessages" (
            "MessageId" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            "Type" character varying(20) NOT NULL,
            "Text" text NOT NULL,
            "SentBy" character varying(200) NOT NULL DEFAULT '',
            "SentAt" timestamp with time zone NOT NULL
        );
        """);
    await db.Database.ExecuteSqlRawAsync("""
        CREATE TABLE IF NOT EXISTS "PaymentCodes" (
            "PaymentCodeId" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
            "Code" character varying(100) NOT NULL UNIQUE,
            "Amount" numeric(18,2) NOT NULL,
            "EventName" character varying(300),
            "EventId" integer NULL,
            "IsRedeemed" boolean NOT NULL DEFAULT false,
            "RedeemedAt" timestamp with time zone NULL,
            "PaymentId" integer NULL,
            "CreatedAt" timestamp with time zone NOT NULL DEFAULT NOW()
        );
        """);
    await db.Database.ExecuteSqlRawAsync("""
        ALTER TABLE "Event"
        ADD COLUMN IF NOT EXISTS "TicketPrice" numeric(18,2) NOT NULL DEFAULT 0;
        """);
    await db.Database.ExecuteSqlRawAsync("""
        ALTER TABLE "Vendor"
        ADD COLUMN IF NOT EXISTS "PhotoUrl" text NULL,
        ADD COLUMN IF NOT EXISTS "AverageRating" numeric(18,2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "TotalReviews" integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "Recommendations" text NULL;
        """);
    await db.Database.ExecuteSqlRawAsync("""
        ALTER TABLE "ServiceProviderProfile"
        ADD COLUMN IF NOT EXISTS "PhotoUrl" text NULL;
        """);
    await RoleSeeder.SeedAsync(db);
    await ComprehensiveSeeder.SeedAsync(db);
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Event Management API v1");
    c.RoutePrefix = "swagger";
});

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.Urls.Add("http://0.0.0.0:5100");

var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "Uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseCors("LocalDev");
app.UseAuthentication();

app.UseMiddleware<InjectionMiddleware>();

var validateSession = builder.Configuration.GetValue<bool>("Security:ValidateSession", true);
if (validateSession)
{
    app.Use(async (context, next) =>
    {
        if (!context.Request.Path.StartsWithSegments("/api") ||
            context.Request.Path.StartsWithSegments("/api/auth"))
        {
            await next();
            return;
        }

        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var sessionId = context.Request.Headers["X-Session-Id"].ToString();
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Session header missing. Please sign in again." });
                return;
            }

            var redis = context.RequestServices.GetRequiredService<IConnectionMultiplexer>().GetDatabase();
            if (!await redis.KeyExistsAsync($"session:{sessionId}"))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { message = "Session is no longer active. Please sign in again." });
                return;
            }
        }

        await next();
    });
}
else
{
    Console.WriteLine("[STARTUP] Session validation middleware is disabled in this environment.");
}

app.UseAuthorization();
app.MapControllers();

Console.WriteLine("[STARTUP] API is live. Swagger at /swagger");

app.Run();
