using System.Globalization;
using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.RateLimiting;
using Furria.Api.Tests.Auth;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Furria.Api.Tests.Proxies;

[Collection("Api")]
public sealed class ForwardedClientAddressTests
{
    private const int PermitsPerIp = 2;

    private readonly ApiTestFixture _fixture;

    public ForwardedClientAddressTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LimitEachClientOnItsOwn_When_TheProxyForwardsTheirAddresses()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        await using var host = HostWithTightPerIpLimit();
        var first = host.CreateClientForwardedFor("203.0.113.10");
        var second = host.CreateClientForwardedFor("203.0.113.20");

        await UseUpThePerIpLimitAsync(first);
        var (response, _) = await LookUpAsync(second);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Should_CountTheProxysPeer_When_AClientForwardsAnAddressOfItsOwn()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        await using var host = HostWithTightPerIpLimit();

        for (var attempt = 0; attempt < PermitsPerIp; attempt++)
            await LookUpAsync(host.CreateClientForwardedFor($"198.51.100.{attempt}, 203.0.113.30"));
        var (response, _) = await LookUpAsync(
            host.CreateClientForwardedFor("198.51.100.99, 203.0.113.30")
        );

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Should_CountTheClientBehindTheEdge_When_TheEdgeIsATrustedProxy()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        await using var host = HostWithTightPerIpLimit();

        await UseUpThePerIpLimitAsync(
            host.CreateClientForwardedFor($"203.0.113.40, {ApiTestFixture.TrustedProxyAddress}")
        );
        var (response, _) = await LookUpAsync(host.CreateClientForwardedFor("203.0.113.40"));

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    private WebApplicationFactory<Program> HostWithTightPerIpLimit() =>
        _fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [
                    $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}"
                ] = PermitsPerIp.ToString(CultureInfo.InvariantCulture),
            }
        );

    private static async Task UseUpThePerIpLimitAsync(HttpClient client)
    {
        for (var attempt = 0; attempt < PermitsPerIp; attempt++)
            await LookUpAsync(client);
    }

    private static Task<TestResult<LookUpInvitationResponse>> LookUpAsync(HttpClient client) =>
        InvitationSteps.LookUpAsync(client, InvitationSteps.UnknownToken());
}
