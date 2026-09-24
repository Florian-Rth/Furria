using System.Diagnostics;

namespace Furria.Api.Errors;

public static class ProblemDetailsExtensions
{
    private const string TraceIdKey = "traceId";

    public static IServiceCollection AddFurriaProblemDetails(this IServiceCollection services) =>
        services
            .AddExceptionHandler<UnhandledExceptionHandler>()
            .AddProblemDetails(options =>
                options.CustomizeProblemDetails = context =>
                    context.ProblemDetails.Extensions[TraceIdKey] = TraceIdOf(context.HttpContext)
            );

    private static string TraceIdOf(HttpContext httpContext) =>
        Activity.Current?.TraceId.ToHexString() ?? httpContext.TraceIdentifier;
}
