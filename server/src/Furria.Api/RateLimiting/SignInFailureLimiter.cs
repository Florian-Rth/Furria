using System.Diagnostics.Contracts;
using System.Net;
using System.Threading.RateLimiting;
using Microsoft.Extensions.Options;

namespace Furria.Api.RateLimiting;

public sealed class SignInFailureLimiter : IDisposable
{
    private const string UnknownClient = "unknown";
    private const int NoPermit = 0;

    private readonly PartitionedRateLimiter<SignInFailurePartition> _limiter;

    public SignInFailureLimiter(IOptions<SignInRateLimitOptions> options)
    {
        var limits = options.Value;
        _limiter = PartitionedRateLimiter.Create<SignInFailurePartition, SignInFailurePartition>(
            partition =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partition,
                    _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = FailuresAllowedIn(partition.Scope, limits),
                        Window = limits.Window,
                        QueueLimit = 0,
                    }
                )
        );
    }

    public bool HasFailedTooOften(SignInFailureScope scope, IPAddress? client)
    {
        using var probe = _limiter.AttemptAcquire(PartitionOf(scope, client), NoPermit);
        return !probe.IsAcquired;
    }

    public void CountFailure(SignInFailureScope scope, IPAddress? client) =>
        _limiter.AttemptAcquire(PartitionOf(scope, client)).Dispose();

    public void Dispose() => _limiter.Dispose();

    [Pure]
    private static SignInFailurePartition PartitionOf(
        SignInFailureScope scope,
        IPAddress? client
    ) => new(scope, client?.ToString() ?? UnknownClient);

    [Pure]
    private static int FailuresAllowedIn(SignInFailureScope scope, SignInRateLimitOptions limits) =>
        scope == SignInFailureScope.Refresh
            ? limits.RejectedRefreshesPerIp
            : limits.FailedLoginsPerIp;

    private readonly record struct SignInFailurePartition(SignInFailureScope Scope, string Client);
}
