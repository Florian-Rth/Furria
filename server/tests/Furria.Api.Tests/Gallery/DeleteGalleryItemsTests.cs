using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class DeleteGalleryItemsTests : IClassFixture<ApiTestFixture>
{
    private static readonly byte[] Bytes = [1, 2, 3, 4];

    private readonly ApiTestFixture _fixture;

    public DeleteGalleryItemsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteRejectsForGoodWithTheirFiles_When_AnUploaderDeletesFromHerInbox()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var rejectId = ctx.Gallery.Items.IdOf("reject");
        await _fixture.PlaceRenditionAsync(rejectId, MediaRendition.Original, Bytes, ct);
        await _fixture.PlaceRenditionAsync(rejectId, MediaRendition.Small, Bytes, ct);
        var original = await _fixture.MediaFileOfAsync(rejectId, MediaRendition.Original, ct);
        var small = await _fixture.MediaFileOfAsync(rejectId, MediaRendition.Small, ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var response = await client.POSTAsync<DeleteGalleryItems, DeleteGalleryItemsRequest>(
            new() { MediaItemIds = [rejectId] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.False(File.Exists(original));
        Assert.False(File.Exists(small));
        await ctx.Expected.GalleryItem(rejectId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheDeletion_When_AnUploaderDeletesFromAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var response = await client.POSTAsync<DeleteGalleryItems, DeleteGalleryItemsRequest>(
            new() { MediaItemIds = [ctx.Gallery.Items.IdOf("placed")] }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_BinTheItemAndDropItFromTheSelection_When_AManagerDeletesFromAnAlbum()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Workbench(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var placedId = ctx.Gallery.Items.IdOf("placed");

        var response = await client.POSTAsync<DeleteGalleryItems, DeleteGalleryItemsRequest>(
            new() { MediaItemIds = [placedId] }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GalleryItem(placedId)
            .ToBeBinnedFrom(ctx.Gallery.Albums.IdOf("gala"), _fixture.TimeProvider.GetUtcNow())
            .GalleryItem(placedId)
            .ToBeUnselected()
            .AssertAsync(ct);
    }

    private static Action<SeedContextBuilder> Workbench() =>
        builder =>
            builder
                .Identity(identity => identity.AddAccount("markus"))
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "fotografie",
                        "fotografie-holding",
                        "Fotografie",
                        "markus",
                        FurriaPermissions.GalleryUpload
                    )
                )
                .Gallery(gallery =>
                    gallery
                        .AddAlbum("gala", "Prunksitzung", sessionStartYear: 2025)
                        .AddGalleryItem("reject", "markus")
                        .AddGalleryItem("placed", "markus", "gala", selectionPosition: 1)
                );
}
