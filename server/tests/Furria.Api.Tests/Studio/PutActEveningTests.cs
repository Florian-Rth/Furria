using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActEveningTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActEveningTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_LandUnplacedInThePlannersTray_When_TheGroupDancesAnEvening() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);

                var response = await DanceHereAsync(admin, actId, gala);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                var planner = await ctx.Identity.ClientForAsync(Planner, ct);
                var line = Assert.Single((await AblaufOfAsync(planner, gala)).Lines);
                Assert.Equal((actId, (int?)null), (line.Act.ActId, line.Position));
            }
        );

    [Fact]
    public Task Should_OfferTheEveningsOfTheActsSession_When_TheGroupHasNotAnsweredYet() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

                var studio = await StudioOfAsync(admin, actId);

                var evening = Assert.Single(studio.Studio!.Evenings);
                Assert.Equal(
                    (ctx.Club.Events.IdOf(Gala), null),
                    (evening.EventId, evening.Appearance)
                );
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheEveningBelongsToAnotherSession() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

                var response = await DanceHereAsync(
                    admin,
                    actId,
                    ctx.Club.Events.IdOf(SummerParty)
                );

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            }
        );

    [Fact]
    public async Task Should_Refuse_When_TheEveningIsOver()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        var actId = 0;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                actId = await GardetanzAsync(ctx, ct);
            }
        );

        await _fixture.AtInstantAsync(
            InTheRunningSession.AddDays(GalaInDays + 1),
            async () =>
            {
                var admin = await ctx!.Identity.SignInAgainAsync(GardeAdmin, ct);

                var response = await DanceHereAsync(admin, actId, ctx.Club.Events.IdOf(Gala));

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            }
        );
    }

    [Fact]
    public Task Should_Forbid_When_ACastMemberIsNoCoEditor() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var anna = await ctx.Identity.ClientForAsync(Anna, ct);

                var response = await DanceHereAsync(anna, actId, ctx.Club.Events.IdOf(Gala));

                Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            }
        );
}
