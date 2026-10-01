using System.Globalization;
using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.RateLimiting;
using Furria.Api.Tests.Auth;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Furria.Api.Tests.Proxies;

[Collection("Api")]
public sealed class ForwardedClientAddressTests
{
    private const int PermitsPerIp = 2;
    private const string ForwardedFor = "X-Forwarded-For";

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
        var first = ClientForwardedFor(host, "203.0.113.10");
        var second = ClientForwardedFor(host, "203.0.113.20");

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
            await LookUpAsync(ClientForwardedFor(host, $"198.51.100.{attempt}, 203.0.113.30"));
        var (response, _) = await LookUpAsync(
            ClientForwardedFor(host, "198.51.100.99, 203.0.113.30")
        );

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Should_CountTheClientBehindTheEdge_When_TheEdgeIsATrustedProxy()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        await using var host = HostWithTightPerIpLimit();

        await UseUpThePerIpLimitAsync(
            ClientForwardedFor(host, $"203.0.113.40, {ApiTestFixture.TrustedProxyAddress}")
        );
        var (response, _) = await LookUpAsync(ClientForwardedFor(host, "203.0.113.40"));

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    private WebApplicationFactory<Program> HostWithTightPerIpLimit() =>
        _fixture.WithWebHostBuilder(builder =>
            builder.UseSetting(
                $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}",
                PermitsPerIp.ToString(CultureInfo.InvariantCulture)
            )
        );

    private static HttpClient ClientForwardedFor(
        WebApplicationFactory<Program> host,
        string forwardedFor
    )
    {
        var client = host.CreateClient();
        client.DefaultRequestHeaders.Add(ForwardedFor, forwardedFor);
        return client;
    }

    private static async Task UseUpThePerIpLimitAsync(HttpClient client)
    {
        for (var attempt = 0; attempt < PermitsPerIp; attempt++)
            await LookUpAsync(client);
    }

    private static Task<TestResult<LookUpInvitationResponse>> LookUpAsync(HttpClient client) =>
        InvitationSteps.LookUpAsync(client, InvitationSteps.UnknownToken());
}
