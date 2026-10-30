using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActSpotTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActSpotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PutTheCastMemberOnTheSpot_When_AnEditorAssignsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var spotId = await AddSpotAsync(admin, actId);
        var anna = ctx.Identity.People.IdOf(Anna);

        var response = await AssignSpotAsync(admin, actId, spotId, anna);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(anna, Assert.Single(studio.Studio!.Spots).Person?.PersonId);
    }

    [Fact]
    public async Task Should_FreeTheOldSpot_When_APersonIsAssignedToAnotherSpot()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var first = await AddSpotAsync(admin, actId);
        var second = await AddSpotAsync(admin, actId);
        var anna = ctx.Identity.People.IdOf(Anna);
        await AssignSpotAsync(admin, actId, first, anna);

        await AssignSpotAsync(admin, actId, second, anna);

        var studio = await StudioOfAsync(admin, actId);
        Assert.Equal(
            [(first, (int?)null), (second, anna)],
            studio.Studio!.Spots.Select(spot => (spot.SpotId, spot.Person?.PersonId))
        );
    }

    [Fact]
    public async Task Should_LeaveTheSpotOpen_When_TheAssignmentIsCleared()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var spotId = await AddSpotAsync(admin, actId);
        await AssignSpotAsync(admin, actId, spotId, ctx.Identity.People.IdOf(Anna));

        await AssignSpotAsync(admin, actId, spotId, null);

        var studio = await StudioOfAsync(admin, actId);
        Assert.Null(Assert.Single(studio.Studio!.Spots).Person);
    }

    [Fact]
    public async Task Should_Refuse_When_ThePersonIsNotInTheCast()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct, removed: [ctx.Identity.People.IdOf(Ben)]);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var spotId = await AddSpotAsync(admin, actId);

        var response = await AssignSpotAsync(admin, actId, spotId, ctx.Identity.People.IdOf(Ben));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TheSpotBelongsToAnotherAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var otherActId = await GardetanzAsync(ctx, ct, name: "Schautanz");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var foreignSpot = await AddSpotAsync(admin, otherActId);

        var response = await AssignSpotAsync(
            admin,
            actId,
            foreignSpot,
            ctx.Identity.People.IdOf(Anna)
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
