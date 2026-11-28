using System.Net;
using Furria.Api.Tests.Media;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Studio.SongReplacementSteps;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PostActSongReplacementTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostActSongReplacementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PutTheNewFileInThePlaceOfTheSong_When_ASongIsReplaced()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var spotId = await AddSpotAsync(mix.Admin, mix.ActId);
        await SaveChoreographyAsync(
            mix.Admin,
            mix.ActId,
            null,
            [TrackWithKeyframeAt(spotId, mix.March.MediaItemId, 20)]
        );
        var newVersion = SoundSamples.Excerpt(March, 5, 55);
        var newFile = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, newVersion, ct);

        var (response, songId) = await ReplaceSongAsync(
            mix.Admin,
            mix.ActId,
            mix.March.SongId,
            newFile
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var songs = await SongCutsOfAsync(mix.Admin, mix.ActId);
        Assert.Equal([newFile, mix.Polka.MediaItemId], songs.Select(song => song.MediaItemId));
        Assert.Equal(5, songs[0].Start, 0.1);
        Assert.Equal(45, songs[0].End, 0.1);
        AssertNear(StepSpans, await StepSpansOfAsync(mix.Admin, mix.ActId));
        var keyframe = Assert.Single(await KeyframesOfAsync(mix.Admin, mix.ActId));
        Assert.Equal(newFile, keyframe.MediaItemId);
        Assert.Equal(15, keyframe.Seconds, 0.1);
        Assert.Equal(
            ChoreographyVersionKind.MusicReplaced,
            (await VersionsOfAsync(mix.Admin, mix.ActId))[0].Kind
        );
        Assert.NotEqual(mix.March.SongId, songId);
    }

    [Fact]
    public async Task Should_MergeTheSongsIntoOne_When_TheNeighbourIsReplacedAlong()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var finalMix = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, FinalMix, ct);

        var (response, _) = await ReplaceSongAsync(
            mix.Admin,
            mix.ActId,
            mix.March.SongId,
            finalMix,
            mix.Polka.SongId
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var song = Assert.Single(await SongCutsOfAsync(mix.Admin, mix.ActId));
        Assert.Equal(finalMix, song.MediaItemId);
        Assert.Equal(5, song.Start, 0.1);
        Assert.Equal(85, song.End, 0.1);
        AssertNear(StepSpans, await StepSpansOfAsync(mix.Admin, mix.ActId));
    }

    [Fact]
    public async Task Should_MoveOnlyTheBordersAfterTheBreak_When_TheNewVersionCutsItOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaWithABorderInTheBreakAsync(_fixture, ct);
        var newFile = await AnalysedFileAsync(
            _fixture,
            mix.Admin,
            mix.ActId,
            MarchWithoutABreak,
            ct
        );

        var (response, _) = await ReplaceSongAsync(mix.Admin, mix.ActId, mix.March.SongId, newFile);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var song = (await SongCutsOfAsync(mix.Admin, mix.ActId))[0];
        Assert.Equal(5, song.Start, 0.1);
        Assert.Equal(37, song.End, 0.1);
        AssertNear(
            [(0, 10), (10, 20.27), (20.27, 32), (32, 72)],
            await StepSpansOfAsync(mix.Admin, mix.ActId)
        );
        Assert.Equal(
            [(false, false), (false, true), (true, false), (false, false)],
            await StepChecksOfAsync(mix.Admin, mix.ActId)
        );
    }

    [Fact]
    public async Task Should_PlaceAVideoByItsOwnSound_When_ItsMusicIsReplaced()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaWithABorderInTheBreakAsync(_fixture, ct);
        var videoId = await AnalysedVideoAsync(
            _fixture,
            mix.Admin,
            mix.ActId,
            SoundSamples.Excerpt(March, 40, 50),
            ct
        );
        await PlaceVideoAsync(mix.Admin, mix.ActId, videoId, 30);
        var newFile = await AnalysedFileAsync(
            _fixture,
            mix.Admin,
            mix.ActId,
            MarchWithoutABreak,
            ct
        );

        var (response, _) = await ReplaceSongAsync(mix.Admin, mix.ActId, mix.March.SongId, newFile);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var video = await VideoInStudioAsync(mix.Admin, mix.ActId, videoId);
        Assert.Equal(22, video.StartSeconds!.Value, 0.1);
    }

    [Fact]
    public async Task Should_RefuseTheReplacement_When_TheNewFileHoldsNoneOfTheSongs()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var waltz = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, Waltz, ct);

        var (response, _) = await ReplaceSongAsync(mix.Admin, mix.ActId, mix.March.SongId, waltz);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            [(mix.March.MediaItemId, 10.0, 50.0), (mix.Polka.MediaItemId, 0.0, 40.0)],
            await SongCutsOfAsync(mix.Admin, mix.ActId)
        );
    }

    [Fact]
    public async Task Should_RefuseTheFile_When_ItIsAlreadyAnotherSong()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);

        var (response, _) = await ReplaceSongAsync(
            mix.Admin,
            mix.ActId,
            mix.March.SongId,
            mix.Polka.MediaItemId
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseToTakeASongAlong_When_AnotherSongPlaysBetween()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var (_, waltzSongId) = await AnalysedSongAsync(
            _fixture,
            mix.Admin,
            mix.ActId,
            Waltz,
            0,
            40,
            ct
        );
        var finalMix = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, FinalMix, ct);

        var (response, _) = await ReplaceSongAsync(
            mix.Admin,
            mix.ActId,
            mix.March.SongId,
            finalMix,
            waltzSongId
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheFile_When_ItIsStillBeingAnalysed()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var unanalysed = await UploadSongAsync(mix.Admin, mix.ActId, ct);

        var (response, _) = await ReplaceSongAsync(
            mix.Admin,
            mix.ActId,
            mix.March.SongId,
            unanalysed
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
