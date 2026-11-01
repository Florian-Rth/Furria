namespace Furria.Api.RateLimiting;

public sealed class LinkUploadRateLimitOptions
{
    public const string SectionName = "RateLimits:LinkUploads";

    public int PermitsPerIp { get; set; } = 3000;

    public TimeSpan Window { get; set; } = TimeSpan.FromHours(1);
}
