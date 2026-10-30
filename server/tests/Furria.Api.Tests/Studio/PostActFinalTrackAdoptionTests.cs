using System.Net;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.EveningSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActFinalTrackAdoptionTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActFinalTrackAdoptionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MoveStepsVideosAndKeyframesOntoTheFinalFile_When_AnEditorAdoptsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, opener, finale) = await MixAsync(ct);
        await MarkedAsync(admin, actId, 10, 70);
        var videoId = await VideoOfAsync(_fixture, admin, actId, 20, ct);
        await PlaceVideoAsync(admin, actId, videoId, 70);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, version) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, opener, 0, 1)]
        );
        var (finalTrackId, finalMedia) = await FinalTrackOfAsync(_fixture, admin, actId, 120, ct);
        await TuneOffsetAsync(admin, actId, finalTrackId, opener, 5);
        await TuneOffsetAsync(admin, actId, finalTrackId, finale, 55);

        var response = await AdoptAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = (await StudioOfAsync(admin, actId)).Studio!;
        Assert.Equal(StudioMusicSource.FinalTrack, studio.Music.Source);
        Assert.Equal(
            [(0d, 15d), (15d, 65d), (65d, 120d)],
            studio.Steps.Select(step => (step.StartSeconds!.Value, step.EndSeconds!.Value))
        );
        Assert.Equal(65, studio.Videos.Single().StartSeconds!.Value, 6);
        var keyframe = studio.Choreography!.Tracks.Single().Keyframes.Single();
        Assert.Equal(
            (finalMedia, 6d, version + 1),
            (keyframe.SourceMediaItemId, keyframe.Seconds, studio.Choreography.Version)
        );
    }

    [Fact]
    public async Task Should_MoveTheStepsOnFromThePreviousFinalFile_When_ANewerOneIsAdopted()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, opener, finale) = await MixAsync(ct);
        await MarkedAsync(admin, actId, 10, 70);
        var (firstId, firstMedia) = await FinalTrackOfAsync(_fixture, admin, actId, 120, ct);
        await TuneOffsetAsync(admin, actId, firstId, opener, 5);
        await TuneOffsetAsync(admin, actId, firstId, finale, 55);
        await AdoptAsync(admin, actId, firstId);
        var (secondId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 125, ct);
        await TuneOffsetAsync(admin, actId, secondId, firstMedia, 2);

        var response = await AdoptAsync(admin, actId, secondId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var studio = (await StudioOfAsync(admin, actId)).Studio!;
        Assert.Equal(
            (secondId, 125d),
            (
                studio.FinalTracks.Single(track => track.Adopted).FinalTrackId,
                studio.Music.LengthSeconds
            )
        );
        Assert.Equal(
            [(0d, 17d), (17d, 67d), (67d, 125d)],
            studio.Steps.Select(step => (step.StartSeconds!.Value, step.EndSeconds!.Value))
        );
    }

    [Fact]
    public Task Should_MoveTheEveningCopyAlongAndKeepItCurrent_When_ItWasMadeFromTheLatestSession() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var (admin, actId, opener, finale, gala) = await EveningMixAsync(ct);
                var spotId = await AddSpotAsync(admin, actId);
                var (_, session) = await SaveChoreographyAsync(
                    admin,
                    actId,
                    null,
                    [StandingTrack(spotId, opener, 0, 1)]
                );
                var (_, copy) = await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    session,
                    [StandingTrack(spotId, opener, 2, 1)]
                );
                var (finalTrackId, finalMedia) = await FinalTrackOfAsync(
                    _fixture,
                    admin,
                    actId,
                    120,
                    ct
                );
                await TuneOffsetAsync(admin, actId, finalTrackId, opener, 5);
                await TuneOffsetAsync(admin, actId, finalTrackId, finale, 55);

                await AdoptAsync(admin, actId, finalTrackId);

                var studio = (await StudioOfAsync(admin, actId)).Studio!;
                var evening = Assert.Single(studio.Evenings).Appearance!.Choreography!;
                var keyframe = evening.Tracks.Single().Keyframes.Single();
                Assert.Equal(
                    (finalMedia, 6d, copy + 1, (int?)studio.Choreography!.Version),
                    (
                        keyframe.SourceMediaItemId,
                        keyframe.Seconds,
                        evening.Version,
                        evening.CopiedFromVersion
                    )
                );
            }
        );

    [Fact]
    public Task Should_KeepTheEveningCopyBehind_When_TheSessionHadMovedOnBeforeTheAdoption() =>
        _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ct = TestContext.Current.CancellationToken;
                var (admin, actId, opener, finale, gala) = await EveningMixAsync(ct);
                var spotId = await AddSpotAsync(admin, actId);
                var (_, session) = await SaveChoreographyAsync(
                    admin,
                    actId,
                    null,
                    [StandingTrack(spotId, opener, 0, 1)]
                );
                await SaveEveningChoreographyAsync(
                    admin,
                    actId,
                    gala,
                    null,
                    session,
                    [StandingTrack(spotId, opener, 2, 1)]
                );
                var (_, movedOn) = await SaveChoreographyAsync(
                    admin,
                    actId,
                    session,
                    [StandingTrack(spotId, opener, 1, 1)]
                );
                var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 120, ct);
                await TuneOffsetAsync(admin, actId, finalTrackId, opener, 5);
                await TuneOffsetAsync(admin, actId, finalTrackId, finale, 55);

                await AdoptAsync(admin, actId, finalTrackId);

                var studio = (await StudioOfAsync(admin, actId)).Studio!;
                var evening = Assert.Single(studio.Evenings).Appearance!.Choreography!;
                Assert.Equal(
                    ((int?)session, movedOn + 1),
                    (evening.CopiedFromVersion, studio.Choreography!.Version)
                );
            }
        );

    [Fact]
    public async Task Should_MarkTheMusicMissing_When_ASongIsNotInTheFinalFile()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, opener, _) = await MixAsync(ct);
        await MarkedAsync(admin, actId, 10, 70);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 60, ct);
        await TuneOffsetAsync(admin, actId, finalTrackId, opener, 0);

        var response = await AdoptAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            [AnchorPlacement.OnTimeline, AnchorPlacement.OnTimeline, AnchorPlacement.MusicMissing],
            (await StudioOfAsync(admin, actId)).Studio!.Steps.Select(step => step.Placement)
        );
    }

    [Fact]
    public async Task Should_ReportConflict_When_TheFinalFileIsStillProcessing()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, _, _) = await MixAsync(ct);
        var (_, finalTrackId) = await PostFinalTrackAsync(
            admin,
            actId,
            await UploadSongAsync(admin, actId, ct)
        );

        var response = await AdoptAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private async Task<(HttpClient Admin, int ActId, int Opener, int Finale)> MixAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var finale = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);

        return (admin, actId, opener, finale);
    }

    private async Task<(
        HttpClient Admin,
        int ActId,
        int Opener,
        int Finale,
        int Gala
    )> EveningMixAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var opener = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);
        var finale = await SongMediaOfAsync(_fixture, admin, actId, 60, ct);

        return (admin, actId, opener, finale, ctx.Club.Events.IdOf(Gala));
    }
}
