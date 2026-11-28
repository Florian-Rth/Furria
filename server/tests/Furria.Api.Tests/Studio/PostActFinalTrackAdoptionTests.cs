using System.Net;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
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
        await StepsBetweenAsync(admin, actId, 10, 70);
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
            [(5d, 15d), (15d, 65d), (65d, 115d)],
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
    public async Task Should_RefuseToBuildOnOrRestoreEarlierChoreographies_When_AnEditorAdoptsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, opener, finale) = await MixAsync(ct);
        var spotId = await AddSpotAsync(admin, actId);
        var (_, version) = await SaveChoreographyAsync(
            admin,
            actId,
            null,
            [StandingTrack(spotId, opener, 0, 1)]
        );
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 120, ct);
        await TuneOffsetAsync(admin, actId, finalTrackId, opener, 5);
        await TuneOffsetAsync(admin, actId, finalTrackId, finale, 55);
        await AdoptAsync(admin, actId, finalTrackId);

        var (save, _) = await SaveChoreographyAsync(
            admin,
            actId,
            version,
            [StandingTrack(spotId, opener, 2, 1)]
        );
        var (restore, _) = await RestoreAsync(admin, actId, version);

        Assert.Equal(
            (HttpStatusCode.Conflict, HttpStatusCode.Conflict),
            (save.StatusCode, restore.StatusCode)
        );
        var versions = await VersionsOfAsync(admin, actId);
        Assert.Equal(ChoreographyVersionKind.MusicAdopted, versions[0].Kind);
    }

    [Fact]
    public async Task Should_RefuseAndLeaveTheMusicAsItWas_When_NoSongWasMatched()
    {
        var ct = TestContext.Current.CancellationToken;
        var (admin, actId, _, _) = await MixAsync(ct);
        await StepsBetweenAsync(admin, actId, 10, 70);
        var (finalTrackId, _) = await FinalTrackOfAsync(_fixture, admin, actId, 120, ct);

        var response = await AdoptAsync(admin, actId, finalTrackId);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var studio = (await StudioOfAsync(admin, actId)).Studio!;
        Assert.Equal(
            (StudioMusicSource.WorkingMix, false),
            (studio.Music.Source, studio.FinalTracks.Single().Adopted)
        );
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
}
