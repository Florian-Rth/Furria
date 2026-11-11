namespace Furria.Api.RateLimiting;

public sealed class SignedOutRateLimitOptions
{
    public const string SectionName = "RateLimits:SignedOut";

    public int PermitsPerIp { get; set; } = 30;

    public int PermitsPerIpOnboarding { get; set; } = 300;

    public int PermitsPerClaimName { get; set; } = 10;

    public int PermitsPerToken { get; set; } = 10;

    public int PermitsPerAddress { get; set; } = 5;

    public TimeSpan Window { get; set; } = TimeSpan.FromMinutes(15);
}
