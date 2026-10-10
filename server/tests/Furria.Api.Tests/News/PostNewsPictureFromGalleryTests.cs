using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.News;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.News;

public sealed class PostNewsPictureFromGalleryTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);
    private static readonly PictureCrop BannerCut = new(0, 0.25, 1, 0.5);
    private static readonly byte[] GalleryOriginal = MediaSamples.Jpeg(4096);

    private readonly ApiTestFixture _fixture;

    public PostNewsPictureFromGalleryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CopyThePhotoIntoThePostsOwnPicture_When_TheEditorPicksItFromTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(DraftAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var photoId = await GalleryPhotoAsync(ctx, "gala-photo", ct);

        var (response, picked) = await PickAsync(client, draftId, photoId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(photoId, picked.MediaItemId);
        await ctx
            .Expected.NewsPost(draftId)
            .ToShowPicture(picked.MediaItemId)
            .MediaItem(picked.MediaItemId)
            .ToBeOwnedBy(MediaOwner.NewsPost(draftId))
            .MediaItem(picked.MediaItemId)
            .ToBeCroppedTo(BannerCut)
            .MediaItem(picked.MediaItemId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .MediaItem(photoId)
            .ToBeOwnedBy(MediaOwner.Gallery)
            .AssertAsync(ct);
        Assert.Equal(
            GalleryOriginal,
            await File.ReadAllBytesAsync(
                await _fixture.MediaFileOfAsync(picked.MediaItemId, MediaRendition.Original, ct),
                ct
            )
        );
    }

    [Fact]
    public async Task Should_RefuseThePick_When_ThePhotoLiesInTheBin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(DraftAndGallery(), ct);
        var client = await ctx.Identity.ClientForAsync(NewsSeeds.Editor, ct);
        var draftId = ctx.News.Posts.IdOf("draft");
        var photoId = await GalleryPhotoAsync(ctx, "binned-photo", ct);

        var (response, _) = await PickAsync(client, draftId, photoId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.NewsPost(draftId).ToShowPicture(null).AssertAsync(ct);
    }

    private async Task<int> GalleryPhotoAsync(SeededContext ctx, string alias, CancellationToken ct)
    {
        var photoId = ctx.Gallery.Items.IdOf(alias);
        await _fixture.PlaceRenditionAsync(photoId, MediaRendition.Original, GalleryOriginal, ct);
        return photoId;
    }

    private static Task<TestResult<PostNewsPictureFromGalleryResponse>> PickAsync(
        HttpClient client,
        int newsPostId,
        int galleryItemId
    ) =>
        client.POSTAsync<
            PostNewsPictureFromGallery,
            PostNewsPictureFromGalleryRequest,
            PostNewsPictureFromGalleryResponse
        >(
            new()
            {
                NewsPostId = newsPostId,
                GalleryItemId = galleryItemId,
                Left = BannerCut.Left,
                Top = BannerCut.Top,
                Width = BannerCut.Width,
                Height = BannerCut.Height,
            }
        );

    private static Action<SeedContextBuilder> DraftAndGallery() =>
        builder =>
            builder
                .WithNewsEditor()
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Galasitzung", sessionStartYear: 2025)
                        .AddGalleryItem("gala-photo", albumAlias: "gala")
                        .AddGalleryItem("binned-photo", albumAlias: "gala", binnedAt: Binned)
                )
                .News(news => news.AddNewsPost("draft", "Gardetanz"));
}
