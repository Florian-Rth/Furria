using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public static class SignedOutRateLimiting
{
    public const string PerIpPolicy = "signed-out-per-ip";
    public const string OnboardingPerIpPolicy = "signed-out-onboarding-per-ip";

    private const string UnknownClient = "unknown";

    public static IServiceCollection AddSignedOutRateLimiting(this IServiceCollection services)
    {
        services
            .AddOptions<SignedOutRateLimitOptions>()
            .BindConfiguration(SignedOutRateLimitOptions.SectionName)
            .Validate(
                options =>
                    options.PermitsPerIp > 0
                    && options.PermitsPerIpOnboarding > 0
                    && options.PermitsPerClaimName > 0
                    && options.PermitsPerToken > 0
                    && options.PermitsPerAddress > 0
                    && options.Window > TimeSpan.Zero,
                $"{SignedOutRateLimitOptions.SectionName} needs positive permits and a window."
            )
            .ValidateOnStart();

        services.AddSingleton<InvitationTokenRateLimiter>();
        services.AddSingleton<AddressRateLimiter>();
        services.AddSingleton<ClaimNameRateLimiter>();

        return services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(
                PerIpPolicy,
                context => PerIpPartition(context, LimitsOf(context).PermitsPerIp)
            );
            options.AddPolicy(
                OnboardingPerIpPolicy,
                context => PerIpPartition(context, LimitsOf(context).PermitsPerIpOnboarding)
            );
        });
    }

    private static SignedOutRateLimitOptions LimitsOf(HttpContext context) =>
        context.RequestServices.GetRequiredService<IOptions<SignedOutRateLimitOptions>>().Value;

    private static RateLimitPartition<string> PerIpPartition(HttpContext context, int permits)
    {
        var window = LimitsOf(context).Window;

        return RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? UnknownClient,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permits,
                Window = window,
                QueueLimit = 0,
            }
        );
    }
}
