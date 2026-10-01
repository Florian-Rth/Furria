namespace Furria.Api.RateLimiting;

public sealed class SignInRateLimitOptions
{
    public const string SectionName = "RateLimits:SignIn";

    public int FailedLoginsPerIp { get; set; } = 20;

    public int RejectedRefreshesPerIp { get; set; } = 20;

    public TimeSpan Window { get; set; } = TimeSpan.FromMinutes(15);
}
