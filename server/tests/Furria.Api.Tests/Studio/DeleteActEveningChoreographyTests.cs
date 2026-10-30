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
public sealed class DeleteActEveningChoreographyTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActEveningChoreographyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_FollowTheSessionAgain_When_TheEveningsCopyIsDropped() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var gala = ctx.Club.Events.IdOf(Gala);
                var march = await UploadSongAsync(admin, actId, ct);
                var spotId = await AddSpotAsync(admin, actId);
                await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    null,
                    [StandingTrack(spotId, march, 2, 1)]
                );

                var response = await DropEveningChoreographyAsync(admin, actId, gala);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                var evening = await EveningOfAsync(admin, actId, gala);
                Assert.Null(evening.Appearance!.Choreography);
            }
        );

    [Fact]
    public Task Should_ReportNotFound_When_TheEveningHasNoCopy() =>
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

                var response = await DropEveningChoreographyAsync(admin, actId, gala);

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
}
