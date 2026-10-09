using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetPublicGalleryPhotoTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);
    private static readonly byte[] MediumRendition = [4, 8, 15, 16, 23, 42];

    private readonly ApiTestFixture _fixture;

    public GetPublicGalleryPhotoTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ServeThePhotoUncachedByTheEdge_When_ItIsInAPublishedSelection()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GalleryWithRenditionAsync(ct);

        var response = await _fixture
            .CreateClient()
            .GetAsync(MediumUrlOf(ctx.Gallery.Items.IdOf("finale")), ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MediumRendition, await response.Content.ReadAsByteArrayAsync(ct));
        Assert.True(response.Headers.CacheControl?.Private);
        Assert.True(response.Headers.CacheControl?.NoCache);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePhotoLeftTheSelection()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GalleryWithRenditionAsync(ct);
        var managing = await ctx.Identity.ManagingLoginClientAsync(ct);
        await managing.PUTAsync<PutGalleryAlbumSelection, PutGalleryAlbumSelectionRequest>(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                Photos =
                [
                    new() { MediaItemId = ctx.Gallery.Items.IdOf("opening"), Caption = null },
                ],
            }
        );

        var response = await _fixture
            .CreateClient()
            .GetAsync(MediumUrlOf(ctx.Gallery.Items.IdOf("finale")), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheAlbumIsUnpublished()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GalleryWithRenditionAsync(ct);
        var managing = await ctx.Identity.ManagingLoginClientAsync(ct);
        await managing.DELETEAsync<UnpublishGalleryAlbum, UnpublishGalleryAlbumRequest>(
            new() { AlbumId = ctx.Gallery.Albums.IdOf("gala") }
        );

        var response = await _fixture
            .CreateClient()
            .GetAsync(MediumUrlOf(ctx.Gallery.Items.IdOf("finale")), ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_TheOriginalIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GalleryWithRenditionAsync(ct);
        var finaleId = ctx.Gallery.Items.IdOf("finale");
        await _fixture.PlaceRenditionAsync(finaleId, MediaRendition.Original, [1, 2, 3], ct);

        var response = await _fixture
            .CreateClient()
            .GetAsync($"/api/public/gallery/photos/{finaleId}/original", ct);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<SeededContext> GalleryWithRenditionAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "gala",
                            "Prunksitzung",
                            sessionStartYear: 2025,
                            publishedAt: Published
                        )
                        .AddGalleryItem("finale", albumAlias: "gala", selectionPosition: 1)
                        .AddGalleryItem("opening", albumAlias: "gala")
                ),
            ct
        );
        await _fixture.PlaceRenditionAsync(
            ctx.Gallery.Items.IdOf("finale"),
            MediaRendition.Medium,
            MediumRendition,
            ct
        );
        return ctx;
    }

    private static string MediumUrlOf(int mediaItemId) =>
        $"/api/public/gallery/photos/{mediaItemId}/medium";
}
