using Furria.Application.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Media;

public sealed class MediaJobTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 1024 * 1024;

    private readonly ApiTestFixture _fixture;

    public MediaJobTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RetryLater_When_RenderingAPhotoFailsTheFirstTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(ctx, "kaputt.jpg", MediaSamples.Jpeg(4096), ct);

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx
            .Expected.MediaItem(mediaItemId)
            .ToAwaitARetry(_fixture.TimeProvider.GetUtcNow().AddMinutes(1))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MarkTheItemFailedWithAReason_When_EveryAttemptFails()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(ctx, "kaputt.mp4", MediaSamples.Mp4(4096), ct);

        await _fixture.RunMediaWorkerAsync(ct);
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            () => _fixture.RunMediaWorkerAsync(ct)
        );
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(11),
            () => _fixture.RunMediaWorkerAsync(ct)
        );

        await ctx.Expected.MediaItem(mediaItemId).ToHaveFailedWith("ffprobe").AssertAsync(ct);
    }

    [Fact]
    public async Task Should_FinishTheItem_When_TheWorkerThatClaimedItStoppedAnswering()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(ctx, "a.jpg", MediaSamples.JpegOfSize(800, 600), ct);
        Assert.True(await _fixture.ClaimMediaJobAsync(MediaKind.Photo, ct));

        await _fixture.RunMediaWorkerAsync(ct);
        await ctx.Expected.MediaItem(mediaItemId).ToBeIn(MediaItemState.Processing).AssertAsync(ct);
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(6),
            () => _fixture.RunMediaWorkerAsync(ct)
        );

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(800, 600).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_HandEachItemToOneWorkerOnly_When_SeveralWorkersClaimAtOnce()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        await UploadAsync(ctx, "a.jpg", MediaSamples.JpegOfSize(80, 60), ct);
        await UploadAsync(ctx, "b.jpg", MediaSamples.JpegOfSize(80, 60), ct);

        var claims = await Task.WhenAll(
            Enumerable.Range(0, 4).Select(_ => _fixture.ClaimMediaJobAsync(MediaKind.Photo, ct))
        );

        Assert.Equal(2, claims.Count(claimed => claimed));
    }

    [Fact]
    public async Task Should_QueueOnlyFailedItemsAgain_When_FailedItemsAreRetried()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var failedId = await UploadAsync(ctx, "kaputt.jpg", MediaSamples.Jpeg(4096), ct);
        var readyId = await UploadAsync(ctx, "gut.jpg", MediaSamples.JpegOfSize(80, 60), ct);
        await _fixture.RunMediaWorkerAsync(ct);
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            () => _fixture.RunMediaWorkerAsync(ct)
        );
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(11),
            () => _fixture.RunMediaWorkerAsync(ct)
        );

        var queued = await _fixture.RegenerateMediaAsync(
            new RegenerateMediaCommand { Scope = MediaRegenerationScope.Failed },
            ct
        );

        Assert.Equal(1, queued);
        await ctx
            .Expected.MediaItem(failedId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .MediaItem(readyId)
            .ToBeReady(80, 60)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RebuildALostRendition_When_AllRenditionsAreRegenerated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(_ => { }, ct);
        var mediaItemId = await UploadAsync(ctx, "a.jpg", MediaSamples.JpegOfSize(800, 600), ct);
        await _fixture.RunMediaWorkerAsync(ct);
        var medium = await _fixture.MediaFileOfAsync(mediaItemId, MediaRendition.Medium, ct);
        File.Delete(medium);

        await _fixture.RegenerateMediaAsync(
            new RegenerateMediaCommand { Scope = MediaRegenerationScope.All },
            ct
        );
        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(mediaItemId).ToBeReady(800, 600).AssertAsync(ct);
        Assert.True(File.Exists(medium));
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
}
