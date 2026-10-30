using System.Buffers.Text;
using System.Diagnostics.Contracts;
using System.Net;
using System.Security.Cryptography;
using System.Text;
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

    public bool HasLoginFailedTooOften(IPAddress? client) => IsExhausted(LoginPartitionOf(client));

    public void CountLoginFailure(IPAddress? client) => Count(LoginPartitionOf(client));

    public bool HasRefreshTokenBeenRejectedTooOften(IPAddress? client, string presentedToken) =>
        IsExhausted(RefreshAddressPartitionOf(client))
        || IsExhausted(RefreshPartitionOf(presentedToken));

    public void CountRejectedRefresh(IPAddress? client, string presentedToken)
    {
        Count(RefreshAddressPartitionOf(client));
        Count(RefreshPartitionOf(presentedToken));
    }

    public void Dispose() => _limiter.Dispose();

    private bool IsExhausted(SignInFailurePartition partition)
    {
        using var probe = _limiter.AttemptAcquire(partition, NoPermit);
        return !probe.IsAcquired;
    }

    private void Count(SignInFailurePartition partition) =>
        _limiter.AttemptAcquire(partition).Dispose();

    [Pure]
    private static SignInFailurePartition LoginPartitionOf(IPAddress? client) =>
        new(SignInFailureScope.Login, AddressOf(client));

    [Pure]
    private static SignInFailurePartition RefreshAddressPartitionOf(IPAddress? client) =>
        new(SignInFailureScope.RefreshFromAddress, AddressOf(client));

    [Pure]
    private static string AddressOf(IPAddress? client) => client?.ToString() ?? UnknownClient;

    [Pure]
    private static SignInFailurePartition RefreshPartitionOf(string presentedToken) =>
        new(
            SignInFailureScope.Refresh,
            Base64Url.EncodeToString(SHA256.HashData(Encoding.UTF8.GetBytes(presentedToken)))
        );

    [Pure]
    private static int FailuresAllowedIn(SignInFailureScope scope, SignInRateLimitOptions limits) =>
        scope switch
        {
            SignInFailureScope.Login => limits.FailedLoginsPerIp,
            SignInFailureScope.Refresh => limits.RejectedRefreshesPerToken,
            SignInFailureScope.RefreshFromAddress => limits.RejectedRefreshesPerIp,
            _ => throw new ArgumentOutOfRangeException(nameof(scope), scope, null),
        };

    private readonly record struct SignInFailurePartition(SignInFailureScope Scope, string Key);
}
