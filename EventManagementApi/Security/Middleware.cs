using System.Text;
using System.Text.RegularExpressions;
using Microsoft.ML;
using Microsoft.Extensions.ML;
using EventManagementApi.Security.Models;

namespace EventManagementApi.Security.Middleware;

public class InjectionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly PredictionEngine<EventManagementApi.Security.Models.SqlData, EventManagementApi.Security.Models.SqlPrediction> _predictor;

    public InjectionMiddleware(RequestDelegate next, PredictionEngine<EventManagementApi.Security.Models.SqlData, EventManagementApi.Security.Models.SqlPrediction> predictor)
    {
        _next = next;
        _predictor = predictor;     
    }

    public async Task InvokeAsync(HttpContext context)  
    {
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

        //ML Prediction
        var prediction = _predictor.Predict(data);
        
        if(prediction.PredictedLabel && prediction.Probability > 0.7){
            context.Response.StatusCode = 400;
            await context.Response.WriteAsync("SQL Injection detected by ML.");
            return;
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
        Console.WriteLine($"Prediction:{result.PredictedLabel}, Probability:{result.Probability}");

        Console.WriteLine($"Precision Results from Testing;");
        Console.WriteLine($"Accuracy: {metrics.Accuracy}");
        Console.WriteLine($"Precision: {metrics.Precision}");
        Console.WriteLine($"Recall: {metrics.Recall}");
        Console.WriteLine($"F1Score: {metrics.F1Score}");
    }*/


}