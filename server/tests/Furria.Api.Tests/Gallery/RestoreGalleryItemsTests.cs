using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class RestoreGalleryItemsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Placed = new(2026, 2, 15, 9, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public RestoreGalleryItemsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_PutTheItemBackIntoItsAlbum_When_AManagerRestoresIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung", sessionStartYear: 2025)
                        .AddGalleryItem(
                            "binned",
                            albumAlias: "gala",
                            placedAt: Placed,
                            binnedAt: Binned
                        )
                ),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var itemId = ctx.Gallery.Items.IdOf("binned");

        var response = await client.POSTAsync<RestoreGalleryItems, RestoreGalleryItemsRequest>(
            new() { MediaItemIds = [itemId] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GalleryItem(itemId)
            .ToBePlacedIn(ctx.Gallery.Albums.IdOf("gala"), Placed)
            .AssertAsync(ct);
    }
}
