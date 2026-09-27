using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Furria.Infrastructure.Identity;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public sealed class AddressRateLimiter : IDisposable
{
    private readonly PartitionedRateLimiter<string> _limiter;

    public AddressRateLimiter(IOptions<SignedOutRateLimitOptions> options)
    {
        var limits = options.Value;
        _limiter = PartitionedRateLimiter.Create<string, string>(partition =>
            RateLimitPartition.GetFixedWindowLimiter(
                partition,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitsPerAddress,
                    Window = limits.Window,
                    QueueLimit = 0,
                }
            )
        );
    }

    public bool TryAcquire(AddressRateLimitScope scope, string email)
    {
        using var lease = _limiter.AttemptAcquire(PartitionOf(scope, email));
        return lease.IsAcquired;
    }

    public void Dispose() => _limiter.Dispose();

    [Pure]
    private static string PartitionOf(AddressRateLimitScope scope, string email) =>
        $"{scope}:{Base64Url.EncodeToString(SHA256.HashData(Encoding.UTF8.GetBytes(NormalizedEmail.Of(email))))}";
}
