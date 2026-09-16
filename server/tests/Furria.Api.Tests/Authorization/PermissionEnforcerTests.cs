using System.Net;
using FastEndpoints;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Authorization;

[Collection("Api")]
public sealed class PermissionEnforcerTests
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private readonly ApiTestFixture _fixture;

    public PermissionEnforcerTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Refuse_When_AnEndpointCarriesBothGatesAndTheCallerHoldsNoKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await client.GETAsync<BothGatesProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_Allow_When_AnEndpointCarriesBothGatesAndTheCallerSatisfiesEach()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.GETAsync<BothGatesProbe, EmptyResponse>();

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
