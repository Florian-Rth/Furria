using System.IO.Compression;
using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryAlbumZipTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Evening = new(2026, 2, 14, 19, 0, 0, TimeSpan.Zero);
    private static readonly byte[] FirstBytes = [1, 1, 1];
    private static readonly byte[] SecondBytes = [2, 2, 2, 2];
    private static readonly byte[] BinnedBytes = [3];

    private readonly ApiTestFixture _fixture;

    public GetGalleryAlbumZipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StreamEveryOriginalInCaptureOrderUnderDistinctNames_When_AMemberDownloadsTheAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Album(), ct);
        await PlaceOriginalsAsync(ctx, ct);
        var zipUrl = await ZipUrlAsync(ctx, ct);

        var response = await _fixture.CreateClient().GetAsync(zipUrl, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/zip", response.Content.Headers.ContentType?.MediaType);
        await using var archive = new ZipArchive(await response.Content.ReadAsStreamAsync(ct));
        Assert.Equal(
            [("IMG_0001.JPG", FirstBytes), ("IMG_0001 (2).JPG", SecondBytes)],
            archive.Entries.Select(entry => (entry.FullName, ContentOf(entry)))
        );
    }

    [Fact]
    public async Task Should_RefuseTheDownload_When_TheSignatureIsTampered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Album(), ct);
        var zipUrl = await ZipUrlAsync(ctx, ct);

        var response = await _fixture.CreateClient().GetAsync(zipUrl + "x", ct);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task PlaceOriginalsAsync(SeededContext ctx, CancellationToken ct)
    {
        await _fixture.PlaceRenditionAsync(
            ctx.Gallery.Items.IdOf("first"),
            MediaRendition.Original,
            FirstBytes,
            ct
        );
        await _fixture.PlaceRenditionAsync(
            ctx.Gallery.Items.IdOf("second"),
            MediaRendition.Original,
            SecondBytes,
            ct
        );
        await _fixture.PlaceRenditionAsync(
            ctx.Gallery.Items.IdOf("binned"),
            MediaRendition.Original,
            BinnedBytes,
            ct
        );
    }

    private static async Task<string> ZipUrlAsync(SeededContext ctx, CancellationToken ct)
    {
        var client = await ctx.Identity.ClientForAsync("lena", ct);
        var (_, album) = await client.GETAsync<
            GetGalleryAlbumById,
            GetGalleryAlbumByIdRequest,
            GetGalleryAlbumByIdResponse
        >(new() { AlbumId = ctx.Gallery.Albums.IdOf("gala") });

        return album.ZipUrl;
    }

    private static byte[] ContentOf(ZipArchiveEntry entry)
    {
        using var content = entry.Open();
        using var copy = new MemoryStream();
        content.CopyTo(copy);
        return copy.ToArray();
    }

    private static Action<SeedContextBuilder> Album() =>
        builder =>
            builder
                .Identity(identity =>
                    identity.AddAccount("lena").AddMembership("lena-membership", "lena")
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung 2026")
                        .AddGalleryItem(
                            "second",
                            albumAlias: "gala",
                            capturedAt: Evening.AddMinutes(5),
                            fileName: "IMG_0001.JPG"
                        )
                        .AddGalleryItem(
                            "first",
                            albumAlias: "gala",
                            capturedAt: Evening,
                            fileName: "IMG_0001.JPG"
                        )
                        .AddGalleryItem(
                            "binned",
                            albumAlias: "gala",
                            binnedAt: Evening,
                            fileName: "IMG_0002.JPG"
                        )
                );
}
