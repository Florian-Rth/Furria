using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class PhotoRenditionTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 1024 * 1024;

    private readonly ApiTestFixture _fixture;

    public PhotoRenditionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderUprightWebPsWithoutLocation_When_ACameraPhotoIsUploaded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GalleryOwner,
            "IMG_0001.jpg",
            MediaSamples.Sample("portrait-with-gps.jpg"),
            ChunkLength,
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeReady(400, 600)
            .MediaItem(mediaItemId)
            .ToBeCapturedAt(
                new DateTimeOffset(2026, 2, 14, 19, 11, 0, TimeSpan.Zero),
                "Canon EOS R6"
            )
            .AssertAsync(ct);
        var small = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Small, ct);
        var large = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Large, ct);
        Assert.Equal((267, 400), RenditionProbe.SizeOf(small));
        Assert.Equal((400, 600), RenditionProbe.SizeOf(large));
        Assert.False(RenditionProbe.CarriesMetadata(small));
        Assert.False(RenditionProbe.CarriesMetadata(large));
    }

    [Fact]
    public async Task Should_RenderThreeSizesByTheLongEdge_When_ALargePhotoIsUploaded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(
            ctx,
            "Umzug.jpg",
            MediaSamples.JpegOfSize(4000, 3000),
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(4000, 3000).AssertAsync(ct);
        Assert.Equal((400, 300), await RenditionSizeAsync(mediaItemId, MediaRendition.Small, ct));
        Assert.Equal(
            (1600, 1200),
            await RenditionSizeAsync(mediaItemId, MediaRendition.Medium, ct)
        );
        Assert.Equal((2560, 1920), await RenditionSizeAsync(mediaItemId, MediaRendition.Large, ct));
    }

    [Fact]
    public async Task Should_ReadTheCaptureTimeAsClubTime_When_AnIPhoneHeicCarriesNoOffset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(
            ctx,
            "IMG_4711.HEIC",
            MediaSamples.Sample("iphone.heic"),
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeReady(640, 480)
            .MediaItem(mediaItemId)
            .ToBeCapturedAt(
                new DateTimeOffset(2026, 2, 14, 19, 11, 0, TimeSpan.Zero),
                "Apple iPhone 15 Pro"
            )
            .AssertAsync(ct);
        var large = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Large, ct);
        Assert.False(RenditionProbe.CarriesMetadata(large));
    }

    [Fact]
    public async Task Should_RenderOnlyTheCropRectangle_When_TheRenditionsOfACroppedPhotoAreRegenerated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(
            ctx,
            "Portrait.jpg",
            MediaSamples.JpegOfSize(3000, 2000),
            ct
        );
        await _fixture.RunMediaWorkerAsync(ct);
        await _fixture.CropMediaItemDirectlyAsync(
            mediaItemId,
            new MediaCrop
            {
                Left = 0.25,
                Top = 0,
                Width = 0.4,
                Height = 0.75,
            },
            ct
        );

        await _fixture.RegenerateMediaAsync(
            new RegenerateMediaCommand
            {
                Scope = MediaRegenerationScope.Items,
                MediaItemIds = [mediaItemId],
            },
            ct
        );
        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(3000, 2000).AssertAsync(ct);
        Assert.Equal((1200, 1500), await RenditionSizeAsync(mediaItemId, MediaRendition.Large, ct));
        Assert.Equal((320, 400), await RenditionSizeAsync(mediaItemId, MediaRendition.Small, ct));
    }

    [Fact]
    public async Task Should_FrameThePortraitInTheMiddleAndKeepTheWholePhoto_When_ItArrivesUncropped()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddPerson("alice")),
            ct
        );
        var mediaItemId = await TusUploadSteps.UploadAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("alice")),
            "Urlaub.jpg",
            MediaSamples.JpegOfSize(4000, 3000),
            ChunkLength,
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToBeReady(4000, 3000)
            .MediaItem(mediaItemId)
            .ToBeCroppedTo(new PictureCrop(0.2, 0, 0.6, 1))
            .AssertAsync(ct);
        Assert.Equal((320, 400), await RenditionSizeAsync(mediaItemId, MediaRendition.Small, ct));
        Assert.Equal(
            (1600, 1200),
            await RenditionSizeAsync(mediaItemId, MediaRendition.Uncropped, ct)
        );
    }

    [Fact]
    public async Task Should_HoldTheGroupPictureAtThreeByTwo_When_TheChosenCutMissesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );
        var mediaItemId = await TusUploadSteps.UploadAsync(
            await ctx.Identity.ManagingLoginClientAsync(ct),
            TusUploadSteps.GroupOwner(ctx.Groups.Groups.IdOf("tanzgarde")),
            "Garde.jpg",
            MediaSamples.JpegOfSize(3000, 3000),
            ChunkLength,
            new PictureCrop(0, 0, 1, 1).Token,
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        Assert.Equal((2560, 1707), await RenditionSizeAsync(mediaItemId, MediaRendition.Large, ct));
    }

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

    private async Task<(int Width, int Height)> RenditionSizeAsync(
        int mediaItemId,
        MediaRendition rendition,
        CancellationToken ct
    ) => RenditionProbe.SizeOf(await _fixture.MediaFileOfAsync(mediaItemId, rendition, ct));
}
