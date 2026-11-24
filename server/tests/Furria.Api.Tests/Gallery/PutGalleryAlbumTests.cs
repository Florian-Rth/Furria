using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PutGalleryAlbumTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PutGalleryAlbumTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WithdrawThePublication_When_TheAlbumLosesItsSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum("album", "Archiv", sessionStartYear: 1985, publishedAt: Published)
                        .AddGalleryItem("scan", albumAlias: "album", selectionPosition: 1)
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var albumId = ctx.Gallery.Albums.IdOf("album");

        var response = await client.PUTAsync<PutGalleryAlbum, PutGalleryAlbumRequest>(
            new()
            {
                AlbumId = albumId,
                Title = "Archiv ohne Jahr",
                Description = "Kiste vom Dachboden",
                CalendarEntryId = null,
                SessionStartYear = null,
                CoverMediaItemId = ctx.Gallery.Items.IdOf("scan"),
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Album(albumId)
            .ToBeTitled("Archiv ohne Jahr", "Kiste vom Dachboden")
            .Album(albumId)
            .ToBeLinkedTo(null, null)
            .Album(albumId)
            .ToHaveChosenCover(ctx.Gallery.Items.IdOf("scan"))
            .Album(albumId)
            .ToBeUnpublished()
            .AssertAsync(ct);
    }
}
