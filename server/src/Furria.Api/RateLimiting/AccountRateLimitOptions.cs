namespace Furria.Api.RateLimiting;

public sealed class AccountRateLimitOptions
{
    public const string SectionName = "RateLimits:Account";

    public int PermitsPerAccount { get; set; } = 5;

    public TimeSpan Window { get; set; } = TimeSpan.FromMinutes(15);
}
