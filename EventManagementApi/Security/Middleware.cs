using System.Text;
using System.Text.RegularExpressions;
using Microsoft.ML;
using EventManagementApi.Security.Models;

namespace EventManagementApi.Security.Middleware;

public class InjectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IServiceProvider _services;

    public InjectionMiddleware(RequestDelegate next, IServiceProvider services)
    {
        _next = next;
        _services = services;
    }

    public async Task InvokeAsync(HttpContext context)  
    {
        if (HttpMethods.IsGet(context.Request.Method) ||
            HttpMethods.IsHead(context.Request.Method) ||
            HttpMethods.IsOptions(context.Request.Method) ||
            context.Request.HasFormContentType)
        {
            await _next(context);
            return;
        }

        // Read request body
        context.Request.EnableBuffering();

        using var reader = new StreamReader(
            context.Request.Body,
            Encoding.UTF8,
            leaveOpen: true
        );

        var body = await reader.ReadToEndAsync();
        context.Request.Body.Position = 0;

        //Rule Based Detection
        if (IsMalicious(body))
        {
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("SQL Injection detected.");
            return;
        }
        //Feature Extraction
        var features = ExtractFeatures(body);
        var data = new EventManagementApi.Security.Models.SqlData
        {
            ContainsOr = features.ContainsOr,
            ContainsUnion = features.ContainsUnion,
            ContainsComment = features.ContainsComment,
            QuoteCount = features.QuoteCount,
            QueryLength = features.QueryLength
        };

        if (features.ContainsOr == 1 || features.ContainsUnion == 1 || features.ContainsComment == 1 || features.QuoteCount > 0)
        {
            var predictor = _services.GetRequiredService<PredictionEngine<SqlData, SqlPrediction>>();
            var prediction = predictor.Predict(data);
            
            if(prediction.Prediction && prediction.Probability > 0.7){
                context.Response.StatusCode = 400;
                await context.Response.WriteAsync("SQL Injection detected by ML.");
                return;
            }
        }

        // Continue request pipeline
        await _next(context);

        Console.WriteLine("Middleware Triggered!");
    }   

    private bool IsMalicious(string input)
    {
        /*if (string.IsNullOrEmpty(input)) return false;

        string pattern = @"(\b(SELECT|INSERT|DELETE|DROP|UNION|OR|AND)\b)|(--|;|'|"")";

        return Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase);*/

        if (string.IsNullOrWhiteSpace(input)) return false;

        input = input.ToLower();

        int score = 0;

        if (Regex.IsMatch(input, @"'\s*or\s*1=1")) score += 5;
        if (Regex.IsMatch(input, @"union\s+select")) score += 5;
        if (Regex.IsMatch(input, @"--")) score += 3;

        if (Regex.IsMatch(input, @"\bor\b")) score += 1;
        if (Regex.IsMatch(input, @"\band\b")) score += 1;

        if (input.Contains("'")) score += 1;
        if (input.Contains(";")) score += 2;

        return score >= 5;
    }

    //Feature Extraction
    private EventManagementApi.Security.Models.SqlFeatures ExtractFeatures(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return new EventManagementApi.Security.Models.SqlFeatures();

        input = input.ToLower();

        return new EventManagementApi.Security.Models.SqlFeatures
        {
            ContainsOr = Regex.IsMatch(input, @"'\s*or") ? 1 : 0,
            ContainsUnion = input.Contains("union") ? 1 : 0,
            ContainsComment = input.Contains("--") ? 1 : 0,
            QuoteCount = input.Count(c => c == '\''),
            QueryLength = input.Length
        };
    }

      /* var Predictor = mlContext.Model.CreatePredictionEngine<SqlData, SqlPrediction>(model);

        var sample = new SqlData
        {
            ContainsOr = 1,
            ContainsUnion = 0,
            ContainsComment = 1,
            QuoteCount = 2,
            QueryLength = 20
        };

    var splitData = mlContext.Data.TrainTestSplit(data, testFraction: 0.2);
    var trainData = splitData.TrainSet;
    var testData = splitData.TestSet;
    var model = pipeline.Fit(trainData);
    var predictions = model.Transform(testData);
    var metrics = mlContext.BinaryClassification.Evaluate(predictions);

        public void TestModel()
    {
        var result = Predictor.Predict(sample);
        Console.WriteLine($"Prediction:{result.Prediction}, Probability:{result.Probability}");

        Console.WriteLine($"Precision Results from Testing;");
        Console.WriteLine($"Accuracy: {metrics.Accuracy}");
        Console.WriteLine($"Precision: {metrics.Precision}");
        Console.WriteLine($"Recall: {metrics.Recall}");
        Console.WriteLine($"F1Score: {metrics.F1Score}");
    }*/


}
