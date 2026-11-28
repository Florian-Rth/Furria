using System.Net;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Studio.SongReplacementSteps;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class DeleteActSongReplacementTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteActSongReplacementTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BringBackTheSongsWithEverythingOnThem_When_TheReplacementIsUndone()
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
        var songId = await FinalMixReplacingBothAsync(mix, ct);

        var response = await UndoReplacementAsync(mix.Admin, mix.ActId, songId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(
            [(mix.March.MediaItemId, 10.0, 50.0), (mix.Polka.MediaItemId, 0.0, 40.0)],
            await SongCutsOfAsync(mix.Admin, mix.ActId)
        );
        Assert.Equal(StepSpans, await StepSpansOfAsync(mix.Admin, mix.ActId));
        Assert.Equal([(mix.March.MediaItemId, 20.0)], await KeyframesOfAsync(mix.Admin, mix.ActId));
    }

    [Fact]
    public async Task Should_NoLongerAskForChecks_When_TheReplacementIsUndone()
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
        var (_, songId) = await ReplaceSongAsync(mix.Admin, mix.ActId, mix.March.SongId, newFile);

        var response = await UndoReplacementAsync(mix.Admin, mix.ActId, songId);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.All(
            await StepChecksOfAsync(mix.Admin, mix.ActId),
            checks => Assert.Equal((false, false), checks)
        );
    }

    [Fact]
    public async Task Should_RefuseTheUndo_When_TheDanceChangedSince()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);
        var songId = await FinalMixReplacingBothAsync(mix, ct);
        await SplitAsync(mix.Admin, mix.ActId, 20);

        var response = await UndoReplacementAsync(mix.Admin, mix.ActId, songId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal(
            songId,
            Assert.Single((await StudioOfAsync(mix.Admin, mix.ActId)).Studio!.Songs).SongId
        );
    }

    [Fact]
    public async Task Should_FindNothingToUndo_When_TheSongWasNeverReplaced()
    {
        var ct = TestContext.Current.CancellationToken;
        var mix = await MarchAndPolkaAsync(_fixture, ct);

        var response = await UndoReplacementAsync(mix.Admin, mix.ActId, mix.March.SongId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<int> FinalMixReplacingBothAsync(MarchAndPolka mix, CancellationToken ct)
    {
        var finalMix = await AnalysedFileAsync(_fixture, mix.Admin, mix.ActId, FinalMix, ct);
        var (response, songId) = await ReplaceSongAsync(
            mix.Admin,
            mix.ActId,
            mix.March.SongId,
            finalMix,
            mix.Polka.SongId
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        return songId;
    }
}
