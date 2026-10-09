using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class RestoreGalleryAlbumTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public RestoreGalleryAlbumTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BringTheAlbumBackUnpublished_When_AManagerRestoresIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery.AddAlbum(
                        "album",
                        "Ordensfest",
                        sessionStartYear: 2025,
                        binnedAt: Binned
                    )
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var albumId = ctx.Gallery.Albums.IdOf("album");

        var response = await client.POSTAsync<RestoreGalleryAlbum, RestoreGalleryAlbumRequest>(
            new() { AlbumId = albumId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Album(albumId)
            .ToBeOutOfTheBin()
            .Album(albumId)
            .ToBeUnpublished()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheRestore_When_TheAlbumIsNotInTheBin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Gallery(gallery => gallery.AddAlbum("album", "Ordensfest")),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await client.POSTAsync<RestoreGalleryAlbum, RestoreGalleryAlbumRequest>(
            new() { AlbumId = ctx.Gallery.Albums.IdOf("album") }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
