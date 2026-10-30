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
public sealed class RestoreActEveningChoreographyVersionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public RestoreActEveningChoreographyVersionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_RestoreTheCopyAndLeaveTheSession_When_AnEditorRestoresAnEarlierCopy() =>
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
                var (_, session) = await SaveChoreographyAsync(
                    admin,
                    actId,
                    null,
                    [StandingTrack(spotId, march, 0, 1)]
                );
                var (_, copy) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    session,
                    [StandingTrack(spotId, march, 2, 1)]
                );
                await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    copy,
                    null,
                    [StandingTrack(spotId, march, 3, 1)]
                );

                var (response, restored) = await RestoreEveningAsync(admin, actId, gala, copy);

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var studio = (await StudioOfAsync(admin, actId)).Studio!;
                var evening = Assert.Single(studio.Evenings).Appearance!.Choreography!;
                Assert.Equal(
                    (copy + 2, 2.0, 0.0),
                    (
                        restored,
                        evening.Tracks.Single().Keyframes.Single().Position.RightMetres,
                        studio.Choreography!.Tracks.Single().Keyframes.Single().Position.RightMetres
                    )
                );
            }
        );

    [Fact]
    public Task Should_ReportNotFound_When_TheEveningHasNoOwnCopy() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
                var actId = await GardetanzAsync(ctx, ct);
                var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
                var march = await UploadSongAsync(admin, actId, ct);
                var spotId = await AddSpotAsync(admin, actId);
                var (_, session) = await SaveChoreographyAsync(
                    admin,
                    actId,
                    null,
                    [StandingTrack(spotId, march, 0, 1)]
                );

                var (response, _) = await RestoreEveningAsync(
                    admin,
                    actId,
                    ctx.Club.Events.IdOf(Gala),
                    session
                );

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
}
