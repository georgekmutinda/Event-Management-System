using Microsoft.EntityFrameworkCore;
using Microsoft.ML;
using EventSecurityAPI.Models;
using EventSecurityAPI.Middleware;
using EventSecurityAPI.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer("Server=localhost;Database=eventmanagementsystemdb;Trusted_Connection=True;TrustServerCertificate=True;"));
builder.Services.AddSingleton<PredictionEngine<SqlData, SqlPrediction>>(serviceProvider =>
{
    var mlContext = new MLContext();

    var TrainData = new List<SqlData>
    { new SqlData { ContainsOr = 0, ContainsUnion = 0, ContainsComment = 0, QuoteCount = 0, QueryLength = 30, Label = false },
      new SqlData { ContainsOr = 1, ContainsUnion = 0, ContainsComment = 1, QuoteCount = 2, QueryLength = 15, Label = true },
      new SqlData { ContainsOr = 0, ContainsUnion = 1, ContainsComment = 0, QuoteCount = 0, QueryLength = 50, Label = true },
      new SqlData { ContainsOr = 1, ContainsUnion = 0, ContainsComment = 2, QuoteCount = 4, QueryLength = 60, Label = false },
    };

    var data = mlContext.Data.LoadFromEnumerable(TrainData);
    var pipeline = mlContext.Transforms.Concatenate(
        "Features",
        nameof(SqlData.ContainsOr),
        nameof(SqlData.ContainsUnion),
        nameof(SqlData.ContainsComment),
        nameof(SqlData.QuoteCount),
        nameof(SqlData.QueryLength)
        )
        .Append(mlContext.BinaryClassification.Trainers.SdcaLogisticRegression());

        var model = pipeline.Fit(data);

        return mlContext.Model.CreatePredictionEngine<SqlData, SqlPrediction>(model);
});

builder.Services.AddControllers();
var app = builder.Build();


//Middleware Registration
app.UseMiddleware<InjectionMiddleware>();
app.MapControllers();
app.Run();