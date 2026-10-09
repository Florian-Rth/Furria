using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GalleryBinPurgeTests : IClassFixture<ApiTestFixture>
{
    private static readonly byte[] Bytes = [1, 2, 3, 4];

    private readonly ApiTestFixture _fixture;

    public GalleryBinPurgeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteWhatLayThirtyDaysInTheBinWithItsFiles_When_ThePurgeRuns()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var expired = now.AddDays(-30).AddMinutes(-1);
        var recent = now.AddDays(-29);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum(
                            "expired-album",
                            "Alt",
                            binnedAt: expired,
                            coverItemAlias: "in-expired"
                        )
                        .AddGalleryItem("in-expired", albumAlias: "expired-album")
                        .AddAlbum("recent-album", "Frisch", binnedAt: recent)
                        .AddGalleryItem("in-recent", albumAlias: "recent-album")
                        .AddAlbum("live", "Prunksitzung")
                        .AddGalleryItem("expired-item", albumAlias: "live", binnedAt: expired)
                        .AddGalleryItem("recent-item", albumAlias: "live", binnedAt: recent)
                        .AddGalleryItem("kept", albumAlias: "live")
                ),
            ct
        );
        var expiredItemId = ctx.Gallery.Items.IdOf("expired-item");
        await _fixture.PlaceRenditionAsync(expiredItemId, MediaRendition.Original, Bytes, ct);
        await _fixture.PlaceRenditionAsync(expiredItemId, MediaRendition.Large, Bytes, ct);
        var original = await _fixture.MediaFileOfAsync(expiredItemId, MediaRendition.Original, ct);
        var large = await _fixture.MediaFileOfAsync(expiredItemId, MediaRendition.Large, ct);

        await _fixture.PurgeGalleryBinAsync(ct);

        Assert.False(File.Exists(original));
        Assert.False(File.Exists(large));
        await ctx
            .Expected.Album(ctx.Gallery.Albums.IdOf("expired-album"))
            .ToNotExist()
            .GalleryItem(ctx.Gallery.Items.IdOf("in-expired"))
            .ToNotExist()
            .GalleryItem(expiredItemId)
            .ToNotExist()
            .Album(ctx.Gallery.Albums.IdOf("recent-album"))
            .ToBeBinnedAt(recent)
            .GalleryItem(ctx.Gallery.Items.IdOf("in-recent"))
            .ToBePlacedIn(ctx.Gallery.Albums.IdOf("recent-album"), now)
            .GalleryItem(ctx.Gallery.Items.IdOf("recent-item"))
            .ToBeBinnedFrom(ctx.Gallery.Albums.IdOf("live"), recent)
            .GalleryItem(ctx.Gallery.Items.IdOf("kept"))
            .ToBePlacedIn(ctx.Gallery.Albums.IdOf("live"), now)
            .AssertAsync(ct);
    }
}
