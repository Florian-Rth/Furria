using FastEndpoints;
using FastEndpoints.Swagger;
using Furria.Application;
using Furria.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddFastEndpoints();
builder.Services.SwaggerDocument(o =>
{
    o.DocumentSettings = s =>
    {
        s.Title = "Furria API";
        s.Version = "v1";
    };
});

var app = builder.Build();

app.UseFastEndpoints(c => c.Endpoints.RoutePrefix = "api");
app.UseSwaggerGen();

app.Run();

public sealed partial class Program;
