using Furria.Api.Authorization;
using Microsoft.AspNetCore.Routing;
using Serilog;

namespace Furria.Api.Logging;

public static class FurriaLogging
{
    private const string RequestCompletedTemplate =
        "HTTP {RequestMethod} {RoutePattern} responded {StatusCode} in {Elapsed:0} ms";

    public static Serilog.ILogger CreateBootstrapLogger(IConfiguration configuration) =>
        new LoggerConfiguration()
            .WriteTo.ConsoleIn(configuration.ConsoleLogFormatOf())
            .CreateLogger();

    public static IServiceCollection AddFurriaLogging(
        this IServiceCollection services,
        IConfiguration configuration
    ) =>
        services.AddSerilog(
            (provider, logger) =>
                logger
                    .ReadFrom.Configuration(configuration)
                    .ReadFrom.Services(provider)
                    .Enrich.FromLogContext()
                    .WriteTo.ConsoleIn(configuration.ConsoleLogFormatOf()),
            preserveStaticLogger: true
        );

    public static IApplicationBuilder UseFurriaRequestLogging(this IApplicationBuilder app) =>
        app.UseSerilogRequestLogging(options =>
        {
            options.Logger = app.ApplicationServices.GetRequiredService<Serilog.ILogger>();
            options.MessageTemplate = RequestCompletedTemplate;
            options.EnrichDiagnosticContext = EnrichRequestEvent;
        });

    private static void EnrichRequestEvent(IDiagnosticContext diagnostics, HttpContext http)
    {
        diagnostics.Set("RoutePattern", RoutePatternOf(http));

        if (http.User.AccountId() is { } accountId)
            diagnostics.Set("AccountId", accountId);
    }

    private static string RoutePatternOf(HttpContext http) =>
        http.GetEndpoint() is RouteEndpoint endpoint
            ? endpoint.RoutePattern.RawText ?? http.Request.Path.Value ?? string.Empty
            : http.Request.Path.Value ?? string.Empty;
}
