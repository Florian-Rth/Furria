using System.Net;
using Furria.Api.Proxies;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Hosting.Internal;
using Microsoft.Extensions.Options;
using Xunit;

namespace Furria.Api.Tests.Proxies;

public sealed class TrustedProxyOptionsTests
{
    private const string TrustedProxiesKey = "ForwardedHeaders:TrustedProxies";

    [Fact]
    public void Should_TrustEveryListedProxy_When_TheyAreAnAddressAndANetwork()
    {
        var options = ForwardedHeadersOptionsOf(
            Environments.Production,
            "10.10.20.1",
            "172.30.0.0/24"
        );

        Assert.Equal(
            [IPNetwork.Parse("10.10.20.1/32"), IPNetwork.Parse("172.30.0.0/24")],
            options.KnownIPNetworks
        );
        Assert.Empty(options.KnownProxies);
    }

    [Fact]
    public void Should_FollowEveryTrustedHop_When_ProxiesAreListed()
    {
        var options = ForwardedHeadersOptionsOf(Environments.Production, "10.10.20.1");

        Assert.Null(options.ForwardLimit);
    }

    [Fact]
    public void Should_TrustNoProxy_When_DevelopmentListsNone()
    {
        var options = ForwardedHeadersOptionsOf(Environments.Development);

        Assert.Empty(options.KnownIPNetworks);
        Assert.Empty(options.KnownProxies);
    }

    [Fact]
    public void Should_RefuseTheOptions_When_ProductionListsNoProxy()
    {
        Assert.Throws<OptionsValidationException>(() =>
            ForwardedHeadersOptionsOf(Environments.Production)
        );
    }

    [Theory]
    [InlineData("10.10.20")]
    [InlineData("10.10.20.0/33")]
    [InlineData("10.10.20.1/16")]
    [InlineData("edge.furria.de")]
    public void Should_RefuseTheOptions_When_AnEntryIsNoAddressOrNetwork(string entry)
    {
        Assert.Throws<OptionsValidationException>(() =>
            ForwardedHeadersOptionsOf(Environments.Development, "10.10.20.1", entry)
        );
    }

    private static ForwardedHeadersOptions ForwardedHeadersOptionsOf(
        string environmentName,
        params string[] trustedProxies
    )
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(
                trustedProxies.Select(
                    (proxy, index) =>
                        new KeyValuePair<string, string?>($"{TrustedProxiesKey}:{index}", proxy)
                )
            )
            .Build();
        using var provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(configuration)
            .AddTrustedProxies(new HostingEnvironment { EnvironmentName = environmentName })
            .BuildServiceProvider();

        return provider.GetRequiredService<IOptions<ForwardedHeadersOptions>>().Value;
    }
}
