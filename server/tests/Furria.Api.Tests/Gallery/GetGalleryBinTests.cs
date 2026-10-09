using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryBinTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGalleryBinTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListBinnedAlbumsAndLooseBinnedItemsWithTheirPurgeDay_When_AManagerLooks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum("binned-album", "Verworfen", binnedAt: Binned)
                        .AddGalleryItem("inside-binned", albumAlias: "binned-album")
                        .AddGalleryItem(
                            "binned-inside-binned",
                            albumAlias: "binned-album",
                            binnedAt: Binned
                        )
                        .AddAlbum("live", "Prunksitzung")
                        .AddGalleryItem("loose", albumAlias: "live", binnedAt: Binned.AddDays(1))
                        .AddGalleryItem("kept", albumAlias: "live")
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<GetGalleryBin, GetGalleryBinResponse>();

        var album = Assert.Single(result.Albums);
        Assert.Equal(
            (ctx.Gallery.Albums.IdOf("binned-album"), 2, Binned.AddDays(30)),
            (album.AlbumId, album.ItemCount, album.PurgesAt)
        );
        var item = Assert.Single(result.Items);
        Assert.Equal(
            (ctx.Gallery.Items.IdOf("loose"), ctx.Gallery.Albums.IdOf("live"), Binned.AddDays(31)),
            (item.Item.MediaItemId, item.AlbumId, item.PurgesAt)
        );
    }
}
