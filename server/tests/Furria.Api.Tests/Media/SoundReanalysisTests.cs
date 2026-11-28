using Furria.Api.Tests.RunningOrders;
using Furria.Core.Media;
using Furria.Core.RunningOrders;
using Furria.Core.Sound;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class SoundReanalysisTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 1024 * 1024;

    private readonly ApiTestFixture _fixture;

    public SoundReanalysisTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnalyseTheSongAgain_When_TheWorkerStartsAfterItsAnalysisChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, mediaItemId) = await AnalysedSongAsync(ct);
        await _fixture.AnalyseSongDirectlyAsync(mediaItemId, 3, 60, ct);
        await _fixture.OutdateSongAnalysisDirectlyAsync(mediaItemId, ct);

        await _fixture.QueueOutdatedSoundAsync(ct);
        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeAnalysedAs(SoundSignal.AnalysisSampleRate, leadingSilenceSeconds: 1, tempoBpm: 120)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheSongPlayable_When_ItWaitsForItsNewAnalysis()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, mediaItemId) = await AnalysedSongAsync(ct);
        await _fixture.OutdateSongAnalysisDirectlyAsync(mediaItemId, ct);

        await _fixture.QueueOutdatedSoundAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeIn(MediaItemState.Ready).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheSongAlone_When_ItsAnalysisIsCurrent()
    {
        var ct = TestContext.Current.CancellationToken;
        await AnalysedSongAsync(ct);

        await _fixture.QueueOutdatedSoundAsync(ct);

        var claimed = true;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () => claimed = await _fixture.ClaimMediaJobAsync(MediaKind.Audio, ct)
        );
        Assert.False(claimed);
    }

    [Fact]
    public async Task Should_KeepTheSongPlayable_When_ItsNewAnalysisFindsNoOriginal()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, mediaItemId) = await AnalysedSongAsync(ct);
        await _fixture.OutdateSongAnalysisDirectlyAsync(mediaItemId, ct);
        await _fixture.DeleteOriginalDirectlyAsync(mediaItemId, ct);

        await _fixture.QueueOutdatedSoundAsync(ct);
        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeIn(MediaItemState.Ready).AssertAsync(ct);
    }

    private async Task<(SeededContext Context, int MediaItemId)> AnalysedSongAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("gerda"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("gerda-tanzgarde", "tanzgarde", "gerda")
                    ),
            ct
        );
        var gerda = await ctx.Identity.ClientForAsync("gerda", ct);
        var actId = await RunningOrderSteps.CreateActAsync(
            gerda,
            "Gardetanz",
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ActKind.Dance
        );
        var song = SoundSamples.Song(seed: 21, bpm: 120, seconds: 20, leadingSilenceSeconds: 1);
        var mediaItemId = await TusUploadSteps.UploadAsync(
            gerda,
            TusUploadSteps.ActOwner(actId),
            "Gardemarsch.wav",
            MediaSamples.WavOf(song),
            ChunkLength,
            ct
        );
        await _fixture.RunMediaWorkerAsync(ct);
        return (ctx, mediaItemId);
    }
}
