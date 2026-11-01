using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PlaceGalleryItemsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PlaceGalleryItemsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeHerItemsOutOfHerInbox_When_AnUploaderFilesThemInAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);
        var albumId = ctx.Gallery.Albums.IdOf("gala");

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new()
            {
                AlbumId = albumId,
                MediaItemIds =
                [
                    ctx.Gallery.Items.IdOf("markus-first"),
                    ctx.Gallery.Items.IdOf("markus-second"),
                ],
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var now = _fixture.TimeProvider.GetUtcNow();
        await ctx
            .Expected.GalleryItem(ctx.Gallery.Items.IdOf("markus-first"))
            .ToBePlacedIn(albumId, now)
            .GalleryItem(ctx.Gallery.Items.IdOf("markus-second"))
            .ToBePlacedIn(albumId, now)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseEveryItem_When_OneSitsInAnotherUploadersInbox()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                MediaItemIds =
                [
                    ctx.Gallery.Items.IdOf("markus-first"),
                    ctx.Gallery.Items.IdOf("anna-only"),
                ],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GalleryItem(ctx.Gallery.Items.IdOf("markus-first"))
            .ToSitInTheInboxOf(ctx.Identity.People.IdOf("markus"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheMove_When_AnUploaderMovesAnItemAlreadyInAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                MediaItemIds = [ctx.Gallery.Items.IdOf("parade-highlight")],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_UnselectTheItemAndWithdrawItsOldAlbum_When_AManagerMovesItsLastSelectedPhoto()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var galaId = ctx.Gallery.Albums.IdOf("gala");

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new() { AlbumId = galaId, MediaItemIds = [ctx.Gallery.Items.IdOf("parade-highlight")] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GalleryItem(ctx.Gallery.Items.IdOf("parade-highlight"))
            .ToBePlacedIn(galaId, _fixture.TimeProvider.GetUtcNow())
            .GalleryItem(ctx.Gallery.Items.IdOf("parade-highlight"))
            .ToBeUnselected()
            .Album(ctx.Gallery.Albums.IdOf("parade"))
            .ToBeUnpublished()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheMove_When_TheItemLiesInTheBin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("gala"),
                MediaItemIds = [ctx.Gallery.Items.IdOf("parade-binned")],
            }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_HandTheItemsToTheGallery_When_AManagerFilesALinksInboxInAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LinkInbox(), ct);
        var client = await ctx.Identity.ClientForAsync("jana", ct);
        var albumId = ctx.Gallery.Albums.IdOf("zug");
        var guestPhotoId = ctx.Gallery.Items.IdOf("guest-photo");

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new() { AlbumId = albumId, MediaItemIds = [guestPhotoId] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GalleryItem(guestPhotoId)
            .ToBePlacedIn(albumId, _fixture.TimeProvider.GetUtcNow())
            .MediaItem(guestPhotoId)
            .ToBeOwnedBy(MediaOwner.Gallery)
            .AssertAsync(ct);
        var (_, inbox) = await client.GETAsync<
            GetUploadLinkInbox,
            GetUploadLinkInboxRequest,
            GetUploadLinkInboxResponse
        >(new() { UploadLinkId = ctx.Gallery.UploadLinks.IdOf("link") });
        Assert.Equal(
            [ctx.Gallery.Items.IdOf("guest-video")],
            inbox.Items.Select(item => item.MediaItemId)
        );
    }

    [Fact]
    public async Task Should_RefuseToFileALinksUpload_When_TheSorterOnlyUploadsToTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(LinkInbox(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var response = await client.POSTAsync<PlaceGalleryItems, PlaceGalleryItemsRequest>(
            new()
            {
                AlbumId = ctx.Gallery.Albums.IdOf("zug"),
                MediaItemIds = [ctx.Gallery.Items.IdOf("guest-photo")],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.MediaItem(ctx.Gallery.Items.IdOf("guest-photo"))
            .ToBeOwnedBy(MediaOwner.UploadLink(ctx.Gallery.UploadLinks.IdOf("link")))
            .AssertAsync(ct);
    }

    private static Action<SeedContextBuilder> LinkInbox() =>
        Photographer(gallery =>
            gallery
                .AddAlbum("zug", "Rosenmontagszug", sessionStartYear: 2025)
                .AddUploadLink("link", "Rosenmontagszug", "jana")
                .AddLinkItem("guest-photo", "link", uploaderName: "Oma Gerda")
                .AddLinkItem("guest-video", "link", kind: MediaKind.Video)
        );

    private static Action<SeedContextBuilder> Workbench() =>
        builder =>
            builder
                .Identity(identity => identity.AddAccount("markus").AddPerson("anna"))
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "fotografie",
                        "fotografie-holding",
                        "Fotografie",
                        "markus",
                        FurriaPermissions.GalleryUpload
                    )
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung", sessionStartYear: 2025)
                        .AddAlbum("parade", "Umzug", sessionStartYear: 2025, publishedAt: Published)
                        .AddGalleryItem("markus-first", "markus")
                        .AddGalleryItem("markus-second", "markus")
                        .AddGalleryItem("anna-only", "anna")
                        .AddGalleryItem(
                            "parade-highlight",
                            "markus",
                            "parade",
                            selectionPosition: 1,
                            caption: "Der Prinzenwagen"
                        )
                        .AddGalleryItem("parade-binned", "markus", "parade", binnedAt: Binned)
                );

    private static Action<SeedContextBuilder> Photographer(
        Action<GallerySeedBuilder>? gallery = null
    ) =>
        builder =>
            builder
                .Gallery(gallery ?? (_ => { }))
                .Identity(identity => identity.AddAccount("jana").AddAccount("markus"))
                .Roles(roles =>
                    roles
                        .AddRoleWithHolder(
                            "fotografie",
                            "fotografie-holding",
                            "Fotografie",
                            "jana",
                            FurriaPermissions.GalleryManage
                        )
                        .AddRoleWithHolder(
                            "galerie",
                            "galerie-holding",
                            "Galerie",
                            "markus",
                            FurriaPermissions.GalleryUpload
                        )
                );
}
