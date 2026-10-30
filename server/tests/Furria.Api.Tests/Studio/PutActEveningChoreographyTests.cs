using System.Net;
using Furria.Api.Endpoints.Acts;
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
public sealed class PutActEveningChoreographyTests : IClassFixture<ApiTestFixture>
{
    private const int Editors = 6;

    private readonly ApiTestFixture _fixture;

    public PutActEveningChoreographyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public Task Should_LeaveTheSessionAsItWas_When_TheEveningGetsItsOwnCopy() =>
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

                var (response, copy) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    session,
                    [StandingTrack(spotId, march, 2, 1)]
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                var studio = (await StudioOfAsync(admin, actId)).Studio!;
                var evening = Assert.Single(studio.Evenings).Appearance!.Choreography!;
                Assert.Equal(
                    (copy, (int?)session, 2.0, 0.0),
                    (
                        evening.Version,
                        evening.CopiedFromVersion,
                        SingleKeyframeOf(evening.Tracks).Position.RightMetres,
                        SingleKeyframeOf(studio.Choreography!.Tracks).Position.RightMetres
                    )
                );
            }
        );

    [Fact]
    public Task Should_ShowThePlannerTheEveningsOwnChoreography_When_ACopyExists() =>
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

                var planner = await ctx.Identity.ClientForAsync(Planner, ct);
                var line = Assert.Single((await AblaufOfAsync(planner, gala)).Lines);
                Assert.Equal([EveningChange.Choreography], line.EveningChanges);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheSessionChangedBeforeTheCopyWasMade() =>
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

                var (response, _) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    ctx.Club.Events.IdOf(Gala),
                    null,
                    null,
                    [StandingTrack(spotId, march, 2, 1)]
                );

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            }
        );

    [Fact]
    public Task Should_Refuse_When_TheCopyChangedElsewhere() =>
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
                var (_, copy) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    null,
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

                var (response, _) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    copy,
                    null,
                    [StandingTrack(spotId, march, 4, 1)]
                );

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
            }
        );

    [Fact]
    public Task Should_KeepOneCopyAndRefuseTheOthers_When_EditorsCopyTheEveningAtOnce() =>
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

                var saves = await Task.WhenAll(
                    Enumerable
                        .Range(1, Editors)
                        .Select(async index =>
                            (
                                RightMetres: index * 0.5,
                                Save: await SaveEveningChoreographyAsync(
                                    admin,
                                    actId,
                                    gala,
                                    null,
                                    null,
                                    [StandingTrack(spotId, march, index * 0.5, 1)]
                                )
                            )
                        )
                );

                var winner = Assert.Single(
                    saves,
                    save => save.Save.Response.StatusCode == HttpStatusCode.OK
                );
                Assert.All(
                    saves.Where(save => save != winner),
                    save => Assert.Equal(HttpStatusCode.Conflict, save.Save.Response.StatusCode)
                );
                var copy = Assert
                    .Single((await StudioOfAsync(admin, actId)).Studio!.Evenings)
                    .Appearance!.Choreography!;
                Assert.Equal(
                    (winner.Save.Version, winner.RightMetres),
                    (copy.Version, SingleKeyframeOf(copy.Tracks).Position.RightMetres)
                );
            }
        );

    private static KeyframeDto SingleKeyframeOf(IReadOnlyList<SpotTrackDto> tracks) =>
        Assert.Single(Assert.Single(tracks).Keyframes);
}
