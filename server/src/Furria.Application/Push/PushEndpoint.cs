using System.Diagnostics.Contracts;

namespace Furria.Application.Push;

public static class PushEndpoint
{
    public const int MaxLength = 2048;

    private static readonly string[] PushServiceHosts =
    [
        "fcm.googleapis.com",
        "push.apple.com",
        "push.services.mozilla.com",
        "notify.windows.com",
    ];

    [Pure]
    public static bool IsKnownPushService(string endpoint) =>
        endpoint.Length <= MaxLength
        && Uri.TryCreate(endpoint, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && uri.IsDefaultPort
        && uri.UserInfo.Length == 0
        && PushServiceHosts.Any(host => IsOrLiesUnder(uri.Host, host));

    [Pure]
    private static bool IsOrLiesUnder(string host, string pushServiceHost) =>
        host.Equals(pushServiceHost, StringComparison.OrdinalIgnoreCase)
        || host.EndsWith($".{pushServiceHost}", StringComparison.OrdinalIgnoreCase);
}
