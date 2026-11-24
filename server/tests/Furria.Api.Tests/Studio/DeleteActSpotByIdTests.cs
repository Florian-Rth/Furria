using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class DeleteActSpotByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActSpotByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheNumberGap_When_ASpotInTheMiddleIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var first = await AddSpotAsync(admin, actId);
        var middle = await AddSpotAsync(admin, actId);
        var last = await AddSpotAsync(admin, actId);

        var response = await DeleteSpotAsync(admin, actId, middle);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [(first, 1), (last, 2)],
            studio.Studio!.Spots.Select(spot => (spot.SpotId, spot.Number))
        );
    }
}
