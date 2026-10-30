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
    public async Task Should_NumberTheSpotsOneAfterAnother_When_AnEditorAddsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var first = await AddSpotAsync(admin, actId);
        var second = await AddSpotAsync(admin, actId);

        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [(first, 1, (int?)null), (second, 2, null)],
            studio.Studio!.Spots.Select(spot => (spot.SpotId, spot.Number, spot.Person?.PersonId))
        );
    }

    [Fact]
    public async Task Should_Forbid_When_ACastMemberWhoIsNoCoEditorAddsASpot()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var anna = await ctx.Identity.ClientForAsync(Anna, ct);

        var response = await anna.POSTAsync<PostActSpot, PostActSpotRequest>(
            new() { ActId = actId }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}
