using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActSpotTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActSpotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NumberEverySpotOnceOrRefuse_When_EditorsAddSpotsAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var responses = await Task.WhenAll(
            Enumerable
                .Range(0, 6)
                .Select(_ =>
                    admin.POSTAsync<PostActSpot, PostActSpotRequest>(new() { ActId = actId })
                )
        );

        Assert.All(
            responses,
            response =>
                Assert.Contains(
                    response.StatusCode,
                    new[] { HttpStatusCode.OK, HttpStatusCode.Conflict }
                )
        );
        var added = responses.Count(response => response.StatusCode == HttpStatusCode.OK);
        Assert.InRange(added, 1, responses.Length);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            Enumerable.Range(1, added),
            studio.Studio!.Spots.Select(spot => spot.Number).Order()
        );
    }
}
