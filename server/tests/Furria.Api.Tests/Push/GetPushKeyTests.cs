using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Push;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Push;

public sealed class GetPushKeyTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetPushKeyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_HandOutTheServersPublicKey_When_ASignedInMemberAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, result) = await client.GETAsync<GetPushKey, GetPushKeyResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ApiTestFixture.VapidPublicKey, result.PublicKey);
    }
}
