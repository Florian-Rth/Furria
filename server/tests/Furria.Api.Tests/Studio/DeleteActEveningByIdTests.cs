using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class DeleteActEveningByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActEveningByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_TakeTheActOffTheEvening_When_ItIsNotInTheAblaufYet() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                await DanceHereAsync(admin, actId, gala);

                var response = await StopDancingHereAsync(admin, actId, gala);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                var planner = await ctx.Identity.ClientForAsync(Planner, ct);
                Assert.Empty((await AblaufOfAsync(planner, gala)).Lines);
            }
        );

    [Fact]
    public Task Should_Refuse_When_ThePlannerHasPlacedTheAct() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var planner = await ctx.Identity.ClientForAsync(Planner, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                await DanceHereAsync(admin, actId, gala);
                var version = (await AblaufOfAsync(planner, gala)).Version;
                await SavedAsync(planner, gala, version, [Line(actId, 0)]);

                var response = await StopDancingHereAsync(admin, actId, gala);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            }
        );
}
