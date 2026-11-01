namespace Furria.Api.RateLimiting;

public static class LinkUploadRateLimiting
{
    public static IServiceCollection AddLinkUploadRateLimiting(this IServiceCollection services)
    {
        services
            .AddOptions<LinkUploadRateLimitOptions>()
            .BindConfiguration(LinkUploadRateLimitOptions.SectionName)
            .Validate(
                options => options.PermitsPerIp > 0 && options.Window > TimeSpan.Zero,
                $"{LinkUploadRateLimitOptions.SectionName} needs positive permits and a window."
            )
            .ValidateOnStart();

        return services.AddSingleton<LinkUploadRateLimiter>();
    }
}
