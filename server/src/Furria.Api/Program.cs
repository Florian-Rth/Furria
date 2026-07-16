using FastEndpoints;
using Furria.Application;
using Furria.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddFastEndpoints();

var app = builder.Build();

app.UseFastEndpoints(c => c.Endpoints.RoutePrefix = "api");

app.Run();

public sealed partial class Program;
