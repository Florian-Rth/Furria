using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryAlbumByIdTests : IClassFixture<ApiTestFixture>
{
    private const long SeededOriginalBytes = 4096;
    private const int GalaItems = 4;

    private static readonly DateTimeOffset Evening = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private readonly ApiTestFixture _fixture;

    public GetGalleryAlbumByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FilterByKindAndUploaderButCountAndSizeTheWholeAlbum_When_FiltersAreAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GalaAlbumSeed(), ct);
        var client = await ctx.Identity.ClientForAsync("lena", ct);
        var albumId = ctx.Gallery.Albums.IdOf("gala");

        var (_, photosOfMarkus) = await client.GETAsync<
            GetGalleryAlbumById,
            GetGalleryAlbumByIdRequest,
            GetGalleryAlbumByIdResponse
        >(
            new()
            {
                AlbumId = albumId,
                Kind = MediaKind.Photo,
                UploaderPersonId = ctx.Identity.People.IdOf("markus"),
            }
        );

        Assert.Equal(
            [ctx.Gallery.Items.IdOf("opening"), ctx.Gallery.Items.IdOf("finale")],
            photosOfMarkus.Items.Select(item => item.MediaItemId)
        );
        Assert.Equal(
            [(ctx.Identity.People.IdOf("markus"), 3), (ctx.Identity.People.IdOf("anna"), 1)],
            photosOfMarkus.Uploaders.Select(uploader =>
                (uploader.Uploader?.PersonId, uploader.Count)
            )
        );
        Assert.Equal(GalaItems * SeededOriginalBytes, photosOfMarkus.ZipBytes);
    }

    private static Action<SeedContextBuilder> GalaAlbumSeed() =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddAccount("lena")
                        .AddMembership("lena-membership", "lena")
                        .AddPerson("markus", "Markus", "Kurz")
                        .AddPerson("anna", "Anna", "König")
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung", sessionStartYear: 2025)
                        .AddGalleryItem("finale", "markus", "gala", capturedAt: Evening.AddHours(3))
                        .AddGalleryItem("opening", "markus", "gala", capturedAt: Evening)
                        .AddGalleryItem(
                            "dance",
                            "markus",
                            "gala",
                            MediaKind.Video,
                            capturedAt: Evening.AddHours(2)
                        )
                        .AddGalleryItem("scan", "anna", "gala", uploadedAt: Evening.AddHours(1))
                        .AddGalleryItem("rejected", "anna", "gala", binnedAt: Evening)
                        .AddGalleryItem("unsorted", "anna")
                        .AddAlbum("binned", "Verworfen", binnedAt: Evening)
                );
}
