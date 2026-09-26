using System.Diagnostics.Contracts;
using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public sealed class AccountRateLimiter : IDisposable
{
    private readonly PartitionedRateLimiter<string> _limiter;

    public AccountRateLimiter(IOptions<AccountRateLimitOptions> options)
    {
        var limits = options.Value;
        _limiter = PartitionedRateLimiter.Create<string, string>(partition =>
            RateLimitPartition.GetFixedWindowLimiter(
                partition,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = limits.PermitsPerAccount,
                    Window = limits.Window,
                    QueueLimit = 0,
                }
            )
        );
    }

    public bool TryAcquire(AccountRateLimitScope scope, int accountId)
    {
        using var lease = _limiter.AttemptAcquire(PartitionOf(scope, accountId));
        return lease.IsAcquired;
    }

    public void Dispose() => _limiter.Dispose();

    [Pure]
    private static string PartitionOf(AccountRateLimitScope scope, int accountId) =>
        string.Create(CultureInfo.InvariantCulture, $"{scope}:{accountId}");
}
