using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using EventSecurityAPI.Models;
using EventSecurityAPI.Middleware;
using EventSecurityAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// 1. Add CORS Policy (Crucial for Frontend Integration)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5500") // Your Nginx Port
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// 2. Use PostgreSQL (Matches your Docker-Compose setup)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. JWT Authentication Setup
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]))
        };
    });

builder.Services.AddAuthorization();

// 4. ML.NET Setup (Kept from your original)
builder.Services.AddSingleton<PredictionEngine<SqlData, SqlPrediction>>(serviceProvider =>
{
    var mlContext = new MLContext();
    var trainData = new List<SqlData>
    { 
        new SqlData { ContainsOr = 0, ContainsUnion = 0, ContainsComment = 0, QuoteCount = 0, QueryLength = 30, Label = false },
        new SqlData { ContainsOr = 1, ContainsUnion = 0, ContainsComment = 1, QuoteCount = 2, QueryLength = 15, Label = true }
    };
    var data = mlContext.Data.LoadFromEnumerable(trainData);
    var pipeline = mlContext.Transforms.Concatenate("Features", "ContainsOr", "ContainsUnion", "ContainsComment", "QuoteCount", "QueryLength")
        .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression());
    var model = pipeline.Fit(data);
    return mlContext.Model.CreatePredictionEngine<SqlData, SqlPrediction>(model);
});

var app = builder.Build();

// 5. Middleware Pipeline Order (Important!)
;
app.UseDefaultFiles(); // Looks for index.html
app.UseStaticFiles();  // Serves files from wwwroot

app.UseRouting();


// Enable CORS
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

// Custom Middleware
app.UseMiddleware<InjectionMiddleware>();

app.MapControllers();
app.Run();

