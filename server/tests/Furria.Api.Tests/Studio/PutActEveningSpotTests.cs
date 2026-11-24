using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActEveningSpotTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActEveningSpotTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_PutTheStandInOnTheSpotForThatEveningOnly_When_SheDancesThere() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                var (anna, clara) = (
                    ctx.Identity.People.IdOf(Anna),
                    ctx.Identity.People.IdOf(Clara)
                );
                var spotId = await AddSpotAsync(admin, actId);
                await AssignSpotAsync(admin, actId, spotId, anna);
                await CastForEveningAsync(admin, actId, gala, clara, dances: true);

                var response = await AssignEveningSpotAsync(admin, actId, gala, spotId, clara);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                var studio = (await StudioOfAsync(admin, actId)).Studio!;
                var change = Assert.Single(Assert.Single(studio.Evenings).Appearance!.SpotChanges);
                Assert.Equal(
                    (anna, spotId, (int?)clara),
                    (
                        Assert.Single(studio.Spots).Person!.PersonId,
                        change.SpotId,
                        change.Person?.PersonId
                    )
                );
            }
        );

    [Fact]
    public Task Should_Refuse_When_ThePersonDoesNotDanceThatEvening() =>
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
                var spotId = await AddSpotAsync(admin, actId);
                await CastForEveningAsync(admin, actId, gala, anna, dances: false);

                var response = await AssignEveningSpotAsync(admin, actId, gala, spotId, anna);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            }
        );
}
