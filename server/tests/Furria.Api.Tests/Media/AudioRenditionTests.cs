using System.Text.Json;
using Furria.Api.Tests.RunningOrders;
using Furria.Core.Media;
using Furria.Core.RunningOrders;
using Furria.Core.Sound;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class AudioRenditionTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 1024 * 1024;

    private readonly ApiTestFixture _fixture;

    public AudioRenditionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderPlayableSoundAndAnalyseIt_When_ASongIsUploadedToAnAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, actId) = await GardeWithDanceAsync(ct);
        var song = SoundSamples.Song(seed: 21, bpm: 120, seconds: 20, leadingSilenceSeconds: 1);
        var mediaItemId = await UploadAsync(
            ctx,
            actId,
            "Gardemarsch.wav",
            MediaSamples.WavOf(song),
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeAnalysedAs(SoundSignal.AnalysisSampleRate, leadingSilenceSeconds: 1, tempoBpm: 120)
            .MediaItem(mediaItemId)
            .ToLastAbout(20)
            .AssertAsync(ct);
        Assert.Equal(
            ("aac", "44100"),
            await RenditionProbe.SoundOf(
                await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Normalised, ct),
                ct
            )
        );
        Assert.Equal(
            ("aac", "44100"),
            await RenditionProbe.SoundOf(
                await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Preview, ct),
                ct
            )
        );
        var peaks = await PeaksOfAsync(mediaItemId, ct);
        Assert.Equal(WaveformPeaks.DefaultPeaksPerSecond, peaks.PeaksPerSecond);
        Assert.Equal(20 * WaveformPeaks.DefaultPeaksPerSecond, peaks.Peaks.Count);
        Assert.All(peaks.Peaks.Take(90), peak => Assert.Equal(0, peak));
        var profile = await SoundProfileOfAsync(mediaItemId, ct);
        Assert.Equal(20, profile.DurationSeconds, 0.05);
    }

    [Fact]
    public async Task Should_KeepTheSoundtrackProfileAndAPhoneRendition_When_AVideoIsUploadedToAnAct()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, actId) = await GardeWithDanceAsync(ct);
        var video = await MediaSamples.VideoAsync(
            [
                "-f",
                "lavfi",
                "-i",
                "testsrc2=size=640x360:rate=25:duration=4",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=440:duration=4:beep_factor=4",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
            ],
            ".mp4",
            ct
        );
        var mediaItemId = await UploadAsync(ctx, actId, "Training.mp4", video, ct);

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(640, 360).AssertAsync(ct);
        var profile = await SoundProfileOfAsync(mediaItemId, ct);
        Assert.Equal(4, profile.DurationSeconds, 0.1);
        Assert.True(
            File.Exists(await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Compact, ct))
        );
    }

    private async Task<WaveformPeaks> PeaksOfAsync(int mediaItemId, CancellationToken ct)
    {
        await using var peaks = File.OpenRead(
            await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Peaks, ct)
        );
        return (
            await JsonSerializer.DeserializeAsync<WaveformPeaks>(
                peaks,
                new JsonSerializerOptions(JsonSerializerDefaults.Web),
                ct
            )
        )!;
    }

    private async Task<SoundProfile> SoundProfileOfAsync(int mediaItemId, CancellationToken ct) =>
        SoundProfile.Parse(
            await File.ReadAllBytesAsync(await _fixture.SoundProfileOfAsync(mediaItemId, ct), ct)
        )!;

    private async Task<int> UploadAsync(
        SeededContext ctx,
        int actId,
        string fileName,
        byte[] content,
        CancellationToken ct
    ) =>
        await TusUploadSteps.UploadAsync(
            await ctx.Identity.ClientForAsync("gerda", ct),
            TusUploadSteps.ActOwner(actId),
            fileName,
            content,
            ChunkLength,
            ct
        );

    private async Task<(SeededContext Context, int ActId)> GardeWithDanceAsync(CancellationToken ct)
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
        var actId = await RunningOrderSteps.CreateActAsync(
            await ctx.Identity.ClientForAsync("gerda", ct),
            "Gardetanz",
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ActKind.Dance
        );
        return (ctx, actId);
    }
}
