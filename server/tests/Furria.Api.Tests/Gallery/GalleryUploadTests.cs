using System.Net;
using Furria.Api.Tests.Media;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GalleryUploadTests : IClassFixture<ApiTestFixture>
{
    private const int ChunkLength = 4096;
    private const string FileName = "Prunksitzung 042.jpg";

    private static readonly DateTimeOffset Binned = new(2026, 3, 1, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GalleryUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SkipTheInbox_When_TheUploadGoesStraightIntoAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Uploader(), ct);
        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var albumId = ctx.Gallery.Albums.IdOf("gala");

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GalleryOwner,
            FileName,
            MediaSamples.Jpeg(2 * ChunkLength + 3),
            ChunkLength,
            ct,
            albumId
        );

        await ctx
            .Expected.GalleryItem(mediaItemId)
            .ToBePlacedIn(albumId, _fixture.TimeProvider.GetUtcNow())
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LandInHerInbox_When_TheUploadNamesNoAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Uploader(), ct);
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var mediaItemId = await TusUploadSteps.UploadAsync(
            client,
            TusUploadSteps.GalleryOwner,
            FileName,
            MediaSamples.Jpeg(ChunkLength),
            ChunkLength,
            ct
        );

        await ctx
            .Expected.GalleryItem(mediaItemId)
            .ToSitInTheInboxOf(ctx.Identity.People.IdOf("ilka"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheAlbumLiesInTheBin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Uploader(), ct);
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.GalleryOwner,
            FileName,
            ChunkLength,
            ct,
            ctx.Gallery.Albums.IdOf("binned")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_APortraitNamesAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Uploader(), ct);
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            TusUploadSteps.PersonOwner(ctx.Identity.People.IdOf("ilka")),
            FileName,
            ChunkLength,
            ct,
            ctx.Gallery.Albums.IdOf("gala")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static Action<SeedContextBuilder> Uploader() =>
        builder =>
            builder
                .Identity(identity => identity.AddAccount("ilka"))
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "galerie",
                        "ilka-galerie",
                        "Galerie",
                        "ilka",
                        FurriaPermissions.GalleryUpload
                    )
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung", sessionStartYear: 2025)
                        .AddAlbum("binned", "Verworfen", binnedAt: Binned)
                );
}
