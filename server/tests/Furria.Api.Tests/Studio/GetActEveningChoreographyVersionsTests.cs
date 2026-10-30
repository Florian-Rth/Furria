using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class GetActEveningChoreographyVersionsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetActEveningChoreographyVersionsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_ListOnlyTheCopysVersions_When_TheEveningHasItsOwnCopy() =>
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
                await SaveChoreographyAsync(
                    admin,
                    actId,
                    session,
                    [StandingTrack(spotId, march, 1, 1)]
                );
                var (_, copy) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    session + 1,
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

                var versions = await EveningVersionsOfAsync(admin, actId, gala);

                Assert.Equal([copy + 1, copy], versions.Select(version => version.Version));
            }
        );

    [Fact]
    public Task Should_ListNothing_When_TheEveningFollowsTheSession() =>
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
                await SaveChoreographyAsync(
                    admin,
                    actId,
                    null,
                    [StandingTrack(spotId, march, 0, 1)]
                );

                var versions = await EveningVersionsOfAsync(
                    admin,
                    actId,
                    ctx.Club.Events.IdOf(Gala)
                );

                Assert.Empty(versions);
            }
        );
}
