namespace Furria.Api.RateLimiting;

public static class SignInRateLimiting
{
    public static IServiceCollection AddSignInRateLimiting(this IServiceCollection services)
    {
        services
            .AddOptions<SignInRateLimitOptions>()
            .BindConfiguration(SignInRateLimitOptions.SectionName)
            .Validate(
                options =>
                    options.FailedLoginsPerIp > 0
                    && options.RejectedRefreshesPerIp > 0
                    && options.Window > TimeSpan.Zero,
                $"{SignInRateLimitOptions.SectionName} needs positive limits and a window."
            )
            .ValidateOnStart();

        return services.AddSingleton<SignInFailureLimiter>();
    }
}
