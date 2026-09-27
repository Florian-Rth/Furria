namespace Furria.Api.RateLimiting;

public static class AccountRateLimiting
{
    public static IServiceCollection AddAccountRateLimiting(this IServiceCollection services)
    {
        services
            .AddOptions<AccountRateLimitOptions>()
            .BindConfiguration(AccountRateLimitOptions.SectionName)
            .Validate(
                options => options.PermitsPerAccount > 0 && options.Window > TimeSpan.Zero,
                $"{AccountRateLimitOptions.SectionName} needs positive permits and a window."
            )
            .ValidateOnStart();

        return services.AddSingleton<AccountRateLimiter>();
    }
}
