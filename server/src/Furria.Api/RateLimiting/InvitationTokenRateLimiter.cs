using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public sealed class InvitationTokenRateLimiter : IDisposable
{
    private readonly PartitionedRateLimiter<string> _limiter;

    public InvitationTokenRateLimiter(IOptions<SignedOutRateLimitOptions> options)
    {
        var limits = options.Value;
        _limiter = PartitionedRateLimiter.Create<string, string>(tokenHash =>
            RateLimitPartition.GetFixedWindowLimiter(
                tokenHash,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitsPerToken,
                    Window = limits.Window,
                    QueueLimit = 0,
                }
            )
        );
    }

    public bool TryAcquire(string presentedToken)
    {
        using var lease = _limiter.AttemptAcquire(HashOf(presentedToken));
        return lease.IsAcquired;
    }

    public void Dispose() => _limiter.Dispose();

    [Pure]
    private static string HashOf(string presentedToken) =>
        Base64Url.EncodeToString(SHA256.HashData(Encoding.UTF8.GetBytes(presentedToken)));
}
