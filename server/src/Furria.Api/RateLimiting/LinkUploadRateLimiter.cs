using System.Net;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public sealed class LinkUploadRateLimiter : IDisposable
{
    private const string UnknownClient = "unknown";

    private readonly PartitionedRateLimiter<string> _limiter;

    public LinkUploadRateLimiter(IOptions<LinkUploadRateLimitOptions> options)
    {
        var limits = options.Value;
        _limiter = PartitionedRateLimiter.Create<string, string>(partition =>
            RateLimitPartition.GetFixedWindowLimiter(
                partition,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitsPerIp,
                    Window = limits.Window,
                    QueueLimit = 0,
                }
            )
        );
    }

    public bool TryAcquire(IPAddress? address)
    {
        using var lease = _limiter.AttemptAcquire(address?.ToString() ?? UnknownClient);
        return lease.IsAcquired;
    }

    public void Dispose() => _limiter.Dispose();
}
