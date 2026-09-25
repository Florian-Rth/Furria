using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public static class SignedOutRateLimiting
{
    public const string PerIpPolicy = "signed-out-per-ip";

    private const string UnknownClient = "unknown";

    public static IServiceCollection AddSignedOutRateLimiting(this IServiceCollection services)
    {
        services
            .AddOptions<SignedOutRateLimitOptions>()
            .BindConfiguration(SignedOutRateLimitOptions.SectionName)
            .Validate(
                options =>
                    options.PermitsPerIp > 0
                    && options.PermitsPerToken > 0
                    && options.Window > TimeSpan.Zero,
                $"{SignedOutRateLimitOptions.SectionName} needs positive permits and a window."
            )
            .ValidateOnStart();

        services.AddSingleton<InvitationTokenRateLimiter>();

        return services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(PerIpPolicy, PerIpPartition);
        });
    }

    private static RateLimitPartition<string> PerIpPartition(HttpContext context)
    {
        var limits = context
            .RequestServices.GetRequiredService<IOptions<SignedOutRateLimitOptions>>()
            .Value;

        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? UnknownClient,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = limits.PermitsPerIp,
                Window = limits.Window,
                QueueLimit = 0,
            }
        );
    }
}
