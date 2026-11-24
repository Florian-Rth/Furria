using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetGroupActsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetGroupActsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_Forbid_When_TheViewerHasNoTieToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Clara, ct);

        var (response, _) = await client.GETAsync<
            GetGroupActs,
            GetGroupActsRequest,
            GetGroupActsResponse
        >(new() { GroupId = ctx.Groups.Groups.IdOf(Garde) });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
