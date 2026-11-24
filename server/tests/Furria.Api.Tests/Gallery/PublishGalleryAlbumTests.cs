using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PublishGalleryAlbumTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Gala = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public PublishGalleryAlbumTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseToPublish_When_NoPhotoIsSelected()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Albums(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var albumId = ctx.Gallery.Albums.IdOf("unselected");

        var response = await client.POSTAsync<PublishGalleryAlbum, PublishGalleryAlbumRequest>(
            new() { AlbumId = albumId }
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private static Action<SeedContextBuilder> Albums() =>
        builder =>
            builder
                .Club(club => club.AddCalendarEntry("gala", "Prunksitzung", Gala))
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("on-entry", "Prunksitzung", calendarEntryAlias: "gala")
                        .AddGalleryItem("chosen", albumAlias: "on-entry", selectionPosition: 1)
                        .AddAlbum("free", "Vereinsheim")
                        .AddGalleryItem("free-chosen", albumAlias: "free", selectionPosition: 1)
                        .AddAlbum("unselected", "Ordensfest", sessionStartYear: 2025)
                        .AddGalleryItem("plain", albumAlias: "unselected")
                );
}
