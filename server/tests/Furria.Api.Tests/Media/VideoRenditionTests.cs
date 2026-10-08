using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class VideoRenditionTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 1024 * 1024;

    private readonly ApiTestFixture _fixture;

    public VideoRenditionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KeepThePictureAndDropTheLocation_When_APlayablePhoneVideoIsUploaded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var video = await MediaSamples.VideoAsync(
            [
                .. TestPicture("640x360", 2),
                .. TestSound(2),
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-c:a",
                "aac",
                "-metadata",
                "location=+50.9375+006.9603/",
                "-metadata",
                "creation_time=2026-02-14T19:11:00Z",
            ],
            ".mov",
            ct
        );
        var mediaItemId = await UploadAsync(ctx, "IMG_0002.MOV", video, ct);

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeReady(640, 360)
            .MediaItem(mediaItemId)
            .ToLastAbout(2)
            .MediaItem(mediaItemId)
            .ToBeCapturedAt(new DateTimeOffset(2026, 2, 14, 19, 11, 0, TimeSpan.Zero), null)
            .AssertAsync(ct);
        var rendition = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Video, ct);
        var facts = await RenditionProbe.VideoFactsOf(rendition, ct);
        Assert.Equal(
            ("h264", "aac", 640, 360),
            (facts.VideoCodec, facts.AudioCodec, facts.Width, facts.Height)
        );
        Assert.DoesNotContain("location", await RenditionProbe.ContainerTagsOf(rendition, ct));
        Assert.True(await RenditionProbe.StartsFastAsync(rendition, ct));
        Assert.Equal((640, 360), await ImageSizeAsync(mediaItemId, MediaRendition.Poster, ct));
        Assert.Equal((400, 225), await ImageSizeAsync(mediaItemId, MediaRendition.Small, ct));
    }

    [Fact]
    public async Task Should_TranscodeTo1080pH264_When_AVideoIsLargerAndInAnotherCodec()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var video = await MediaSamples.VideoAsync(
            [.. TestPicture("2560x1440", 1), .. TestSound(1), "-c:v", "mpeg4", "-c:a", "pcm_s16le"],
            ".mov",
            ct
        );
        var mediaItemId = await UploadAsync(ctx, "Kamera.mov", video, ct);

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(2560, 1440).AssertAsync(ct);
        var rendition = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Video, ct);
        var facts = await RenditionProbe.VideoFactsOf(rendition, ct);
        Assert.Equal(
            ("h264", "yuv420p", "aac", 1920, 1080),
            (facts.VideoCodec, facts.PixelFormat, facts.AudioCodec, facts.Width, facts.Height)
        );
        Assert.True(await RenditionProbe.StartsFastAsync(rendition, ct));
    }

    [Fact]
    public async Task Should_ShowAnUprightPortrait_When_APhoneRecordedTheVideoTurned()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var landscape = await MediaSamples.VideoAsync(
            [.. TestPicture("1280x720", 1), "-c:v", "libx264", "-pix_fmt", "yuv420p"],
            ".mp4",
            ct
        );
        var mediaItemId = await UploadAsync(
            ctx,
            "Hochkant.mp4",
            await MediaSamples.RotatedAsync(landscape, 90, ct),
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(720, 1280).AssertAsync(ct);
        var rendition = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Video, ct);
        var facts = await RenditionProbe.VideoFactsOf(rendition, ct);
        Assert.Equal((720, 1280), (facts.Width, facts.Height));
        Assert.Equal((720, 1280), await ImageSizeAsync(mediaItemId, MediaRendition.Poster, ct));
    }

    [Fact]
    public async Task Should_ToneMapToStandardRange_When_AnHdrVideoIsUploaded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var video = await MediaSamples.VideoAsync(
            [
                .. TestPicture("1280x720", 1),
                "-c:v",
                "libx265",
                "-preset",
                "ultrafast",
                "-pix_fmt",
                "yuv420p10le",
                "-color_primaries",
                "bt2020",
                "-color_trc",
                "arib-std-b67",
                "-colorspace",
                "bt2020nc",
                "-tag:v",
                "hvc1",
            ],
            ".mov",
            ct
        );
        var mediaItemId = await UploadAsync(ctx, "IMG_0003.MOV", video, ct);

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(1280, 720).AssertAsync(ct);
        var rendition = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Video, ct);
        var facts = await RenditionProbe.VideoFactsOf(rendition, ct);
        Assert.Equal(
            ("h264", "yuv420p", false),
            (facts.VideoCodec, facts.PixelFormat, facts.IsHdr)
        );
        Assert.Null(facts.AudioCodec);
    }

    private static string[] TestPicture(string size, int seconds) =>
        ["-f", "lavfi", "-i", $"testsrc2=size={size}:rate=25:duration={seconds}"];

    private static string[] TestSound(int seconds) =>
        ["-f", "lavfi", "-i", $"sine=frequency=440:duration={seconds}"];

    private async Task<(int Width, int Height)> ImageSizeAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    ) => RenditionProbe.SizeOf(await _fixture.MediaFileOfAsync(mediaItemId, rendition, ct));

    private async Task<int> UploadAsync(
        SeededContext ctx,
        string fileName,
        byte[] content,
        CancellationToken ct
    ) =>
        await TusUploadSteps.UploadAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            TusUploadSteps.GalleryOwner,
            fileName,
            content,
            ChunkLength,
            ct
        );
}
