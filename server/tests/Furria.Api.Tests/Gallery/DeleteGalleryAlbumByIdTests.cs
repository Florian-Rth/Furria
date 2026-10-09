using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class DeleteGalleryAlbumByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Published = new(2026, 2, 20, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public DeleteGalleryAlbumByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BinTheAlbumWithItsItemsAndWithdrawIt_When_AManagerDeletesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "album",
                            "Ordensfest",
                            sessionStartYear: 2025,
                            publishedAt: Published
                        )
                        .AddGalleryItem("photo", albumAlias: "album", selectionPosition: 1)
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var albumId = ctx.Gallery.Albums.IdOf("album");

        var response = await client.DELETEAsync<
            DeleteGalleryAlbumById,
            DeleteGalleryAlbumByIdRequest
        >(new() { AlbumId = albumId });

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Album(albumId)
            .ToBeBinnedAt(_fixture.TimeProvider.GetUtcNow())
            .Album(albumId)
            .ToBeUnpublished()
            .GalleryItem(ctx.Gallery.Items.IdOf("photo"))
            .ToBeSelectedAt(1, null)
            .AssertAsync(ct);
    }
}
