using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PutGalleryAlbumSelectionTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PutGalleryAlbumSelectionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReplaceTheSelectionInTheGivenOrderWithCaptions_When_APublisherSetsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Album(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await client.PUTAsync<
            PutGalleryAlbumSelection,
            PutGalleryAlbumSelectionRequest
        >(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                Photos =
                [
                    new() { MediaItemId = ctx.Gallery.Items.IdOf("finale"), Caption = " Finale " },
                    new() { MediaItemId = ctx.Gallery.Items.IdOf("opening"), Caption = "" },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GalleryItem(ctx.Gallery.Items.IdOf("finale"))
            .ToBeSelectedAt(1, "Finale")
            .GalleryItem(ctx.Gallery.Items.IdOf("opening"))
            .ToBeSelectedAt(2, null)
            .GalleryItem(ctx.Gallery.Items.IdOf("held"))
            .ToBeUnselected()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheSelection_When_ItNamesAVideo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Album(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await client.PUTAsync<
            PutGalleryAlbumSelection,
            PutGalleryAlbumSelectionRequest
        >(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                Photos = [new() { MediaItemId = ctx.Gallery.Items.IdOf("dance"), Caption = null }],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx
            .Expected.GalleryItem(ctx.Gallery.Items.IdOf("held"))
            .ToBeSelectedAt(1, "Einzug")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheSelection_When_ItNamesAPhotoOfAnotherAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Album(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await client.PUTAsync<
            PutGalleryAlbumSelection,
            PutGalleryAlbumSelectionRequest
        >(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                Photos =
                [
                    new() { MediaItemId = ctx.Gallery.Items.IdOf("foreign"), Caption = null },
                ],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_WithdrawThePublication_When_TheSelectionIsEmptied()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Album(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var albumId = ctx.Gallery.Albums.IdOf("gala");

        var response = await client.PUTAsync<
            PutGalleryAlbumSelection,
            PutGalleryAlbumSelectionRequest
        >(new() { AlbumId = albumId, Photos = [] });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Album(albumId)
            .ToBeUnpublished()
            .GalleryItem(ctx.Gallery.Items.IdOf("held"))
            .ToBeUnselected()
            .AssertAsync(ct);
    }

    private static Action<SeedContextBuilder> Album() =>
        builder =>
            builder.Gallery(gallery =>
                gallery
                    .AddAlbum(
                        "gala",
                        "Prunksitzung",
                        sessionStartYear: 2025,
                        publishedAt: Published
                    )
                    .AddGalleryItem(
                        "held",
                        albumAlias: "gala",
                        selectionPosition: 1,
                        caption: "Einzug"
                    )
                    .AddGalleryItem("opening", albumAlias: "gala")
                    .AddGalleryItem("finale", albumAlias: "gala")
                    .AddGalleryItem("dance", albumAlias: "gala", kind: MediaKind.Video)
                    .AddAlbum("other", "Umzug", sessionStartYear: 2025)
                    .AddGalleryItem("foreign", albumAlias: "other")
            );
}
