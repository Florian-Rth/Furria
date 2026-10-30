using System.Net;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActEveningCastTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActEveningCastTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_LeaveTheDancerOutOfThatEveningOnly_When_SheDoesNotDanceThere() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                var anna = ctx.Identity.People.IdOf(Anna);

                var response = await CastForEveningAsync(admin, actId, gala, anna, dances: false);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                var evening = await EveningOfAsync(admin, actId, gala);
                Assert.Equal([anna], evening.Appearance!.RemovedPersonIds);
                var planner = await ctx.Identity.ClientForAsync(Planner, ct);
                var line = Assert.Single((await AblaufOfAsync(planner, gala)).Lines);
                Assert.DoesNotContain(line.Act.Cast, member => member.PersonId == anna);
                Assert.Equal([EveningChange.Cast], line.EveningChanges);
            }
        );

    [Fact]
    public Task Should_AddTheStandIn_When_SomeoneOutsideTheCastDancesThatEvening() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                var clara = ctx.Identity.People.IdOf(Clara);

                await CastForEveningAsync(admin, actId, gala, clara, dances: true);

                var evening = await EveningOfAsync(admin, actId, gala);
                Assert.Equal(clara, Assert.Single(evening.Appearance!.Added).PersonId);
            }
        );

    [Fact]
    public Task Should_ForgetTheChange_When_TheDancerIsBackForTheEvening() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                var anna = ctx.Identity.People.IdOf(Anna);
                await CastForEveningAsync(admin, actId, gala, anna, dances: false);

                await CastForEveningAsync(admin, actId, gala, anna, dances: true);

                var appearance = (await EveningOfAsync(admin, actId, gala)).Appearance!;
                Assert.Equal(0, appearance.RemovedPersonIds.Count + appearance.Added.Count);
            }
        );
}
