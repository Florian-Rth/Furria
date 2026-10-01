using System.Diagnostics.Contracts;
using System.Net;
using System.Net.Sockets;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Options;
using IPNetwork = System.Net.IPNetwork;

namespace Furria.Api.Proxies;

public static class TrustedProxies
{
    private const int IPv4AddressBits = 32;
    private const int IPv6AddressBits = 128;

    public static IServiceCollection AddTrustedProxies(
        this IServiceCollection services,
        IHostEnvironment environment
    )
    {
        services
            .AddOptions<TrustedProxyOptions>()
            .BindConfiguration(TrustedProxyOptions.SectionName)
            .Validate(
                options => options.TrustedProxies.All(entry => NetworkOf(entry) is not null),
                $"{TrustedProxyOptions.SectionName}:TrustedProxies must be IP addresses or "
                    + "CIDR networks."
            )
            .Validate(
                options => !environment.IsProduction() || options.TrustedProxies.Length > 0,
                $"{TrustedProxyOptions.SectionName}:TrustedProxies must name the proxies in "
                    + "front of the API in production."
            )
            .ValidateOnStart();

        services
            .AddOptions<ForwardedHeadersOptions>()
            .Configure<IOptions<TrustedProxyOptions>>(
                (forwarded, trusted) => TrustOnly(forwarded, trusted.Value)
            );

        return services;
    }

    private static void TrustOnly(ForwardedHeadersOptions forwarded, TrustedProxyOptions trusted)
    {
        forwarded.ForwardedHeaders =
            ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        forwarded.ForwardLimit = null;
        forwarded.KnownProxies.Clear();
        forwarded.KnownIPNetworks.Clear();
        foreach (var entry in trusted.TrustedProxies)
            forwarded.KnownIPNetworks.Add(NetworkOf(entry)!.Value);
    }

    [Pure]
    private static IPNetwork? NetworkOf(string entry)
    {
        var parts = entry.Split('/');
        if (parts.Length > 2 || WholeAddressOf(parts[0]) is not { } address)
            return null;

        if (parts.Length == 1)
            return new IPNetwork(address, BitsOf(address));

        return IPNetwork.TryParse(entry, out var network) && network.BaseAddress.Equals(address)
            ? network
            : null;
    }

    [Pure]
    private static IPAddress? WholeAddressOf(string text) =>
        IPAddress.TryParse(text, out var address) && IsWholeAddress(text, address) ? address : null;

    [Pure]
    private static bool IsWholeAddress(string text, IPAddress address) =>
        address.AddressFamily == AddressFamily.InterNetworkV6 || text.Count(c => c == '.') == 3;

    [Pure]
    private static int BitsOf(IPAddress address) =>
        address.AddressFamily == AddressFamily.InterNetwork ? IPv4AddressBits : IPv6AddressBits;
}
