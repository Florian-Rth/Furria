using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Furria.Core.Identity;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public sealed class ClaimNameRateLimiter : IDisposable
{
    private const char NameSeparator = '|';

    private readonly PartitionedRateLimiter<string> _limiter;

    public ClaimNameRateLimiter(IOptions<SignedOutRateLimitOptions> options)
    {
        var limits = options.Value;
        _limiter = PartitionedRateLimiter.Create<string, string>(partition =>
            RateLimitPartition.GetFixedWindowLimiter(
                partition,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitsPerClaimName,
                    Window = limits.Window,
                    QueueLimit = 0,
                }
            )
        );
    }

    public bool TryAcquire(string firstName, string lastName)
    {
        using var lease = _limiter.AttemptAcquire(PartitionOf(firstName, lastName));
        return lease.IsAcquired;
    }

    public void Dispose() => _limiter.Dispose();

    [Pure]
    private static string PartitionOf(string firstName, string lastName) =>
        Base64Url.EncodeToString(
            SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    $"{ClaimName.Normalize(firstName)}{NameSeparator}{ClaimName.Normalize(lastName)}"
                )
            )
        );
}
