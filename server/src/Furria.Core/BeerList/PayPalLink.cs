using System.Diagnostics.Contracts;

namespace Furria.Core.BeerList;

public static class PayPalLink
{
    private static readonly HashSet<string> MeHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "paypal.me",
        "www.paypal.me",
    };

    private static readonly HashSet<string> ComHosts = new(StringComparer.OrdinalIgnoreCase)
    {
        "paypal.com",
        "www.paypal.com",
    };

    [Pure]
    public static bool IsValid(string link) =>
        Uri.TryCreate(link, UriKind.Absolute, out var uri)
        && uri.Scheme == Uri.UriSchemeHttps
        && NamesAnAccount(uri);

    [Pure]
    private static bool NamesAnAccount(Uri uri) =>
        MeHosts.Contains(uri.Host)
            ? uri.AbsolutePath.Length > 1
            : ComHosts.Contains(uri.Host)
                && uri.AbsolutePath.StartsWith("/paypalme/", StringComparison.OrdinalIgnoreCase)
                && uri.AbsolutePath.Length > "/paypalme/".Length;
}
