using System.Text.Json;
using System.Text.Json.Serialization;
using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using Furria.Api.Authentication;
using Furria.Api.Authorization;
using Furria.Application;
using Furria.Application.Identity;
using Furria.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;

var builder = WebApplication.CreateBuilder(args);

var accessToken =
    builder.Configuration.GetSection(AccessTokenOptions.SectionName).Get<AccessTokenOptions>()
    ?? new AccessTokenOptions();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddAuthenticationJwtBearer(
    signing => signing.SigningKey = accessToken.SigningKey,
    bearer =>
    {
        bearer.TokenValidationParameters.ValidIssuer = accessToken.Issuer;
        bearer.TokenValidationParameters.ValidAudience = accessToken.Audience;
    }
);
builder
    .Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<TimeProvider>(
        (bearer, timeProvider) =>
            bearer.TokenValidationParameters.LifetimeValidator = (notBefore, expires, _, _) =>
                AccessTokenLifetime.IsCurrent(
                    notBefore,
                    expires,
                    timeProvider.GetUtcNow().UtcDateTime
                )
    );
builder.Services.AddAuthorization();
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

app.UseAuthentication();
app.UseAuthorization();
app.UseFastEndpoints(c =>
{
    c.Endpoints.RoutePrefix = "api";
    c.Serializer.Options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    c.Endpoints.Configurator = endpoint => endpoint.PreProcessor<PermissionEnforcer>(Order.Before);
});
app.UseSwaggerGen();

app.Run();

public sealed partial class Program;
