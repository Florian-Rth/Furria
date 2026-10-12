using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryItemsTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Evening = new(2026, 10, 3, 19, 0, 0, TimeSpan.Zero);

    private static readonly string[] AllAliases =
    [
        "developing",
        "developed",
        "binned-item",
        "in-binned-album",
        "markus-inbox",
        "anna-inbox",
        "orphan",
    ];

    private readonly ApiTestFixture _fixture;

    public GetGalleryItemsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AnswerOnlyLiveAlbumItemsWithTheirState_When_AMemberAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Items(), ct);
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (_, result) = await client.GETAsync<
            GetGalleryItems,
            GetGalleryItemsRequest,
            GetGalleryItemsResponse
        >(new() { Ids = [.. AllAliases.Select(ctx.Gallery.Items.IdOf), int.MaxValue] });

        Assert.Equal(
            [
                (ctx.Gallery.Items.IdOf("developing"), MediaItemState.Processing),
                (ctx.Gallery.Items.IdOf("developed"), MediaItemState.Ready),
            ],
            result.Items.Select(item => (item.MediaItemId, item.State)).Order()
        );
    }

    [Fact]
    public async Task Should_AddHerOwnInboxItems_When_AnUploaderAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Items(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var (_, result) = await client.GETAsync<
            GetGalleryItems,
            GetGalleryItemsRequest,
            GetGalleryItemsResponse
        >(new() { Ids = [.. AllAliases.Select(ctx.Gallery.Items.IdOf)] });

        Assert.Equal(
            [
                ctx.Gallery.Items.IdOf("developing"),
                ctx.Gallery.Items.IdOf("developed"),
                ctx.Gallery.Items.IdOf("markus-inbox"),
            ],
            result.Items.Select(item => item.MediaItemId).Order()
        );
    }

    [Fact]
    public async Task Should_AnswerEveryInboxItem_When_AManagerAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Items(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetGalleryItems,
            GetGalleryItemsRequest,
            GetGalleryItemsResponse
        >(new() { Ids = [.. AllAliases.Select(ctx.Gallery.Items.IdOf)] });

        Assert.Equal(
            [
                ctx.Gallery.Items.IdOf("developing"),
                ctx.Gallery.Items.IdOf("developed"),
                ctx.Gallery.Items.IdOf("markus-inbox"),
                ctx.Gallery.Items.IdOf("anna-inbox"),
                ctx.Gallery.Items.IdOf("orphan"),
            ],
            result.Items.Select(item => item.MediaItemId).Order()
        );
    }

    [Fact]
    public async Task Should_RefuseTheRequest_When_ItAsksForMoreItemsThanOnePollCarries()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Items(), ct);
        var client = await ctx.Identity.ClientForAsync("lena", ct);

        var (response, _) = await client.GETAsync<
            GetGalleryItems,
            GetGalleryItemsRequest,
            GetGalleryItemsResponse
        >(new() { Ids = [.. Enumerable.Range(1, GetGalleryItemsValidator.MaxIds + 1)] });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static Action<SeedContextBuilder> Items() =>
        builder =>
            builder
                .Identity(identity =>
                    identity
                        .AddAccount("lena")
                        .AddMembership("lena-membership", "lena")
                        .AddAccount("markus")
                        .AddPerson("anna")
                )
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
                        .AddAlbum("binned", "Verworfen", binnedAt: Evening)
                        .AddGalleryItem(
                            "developing",
                            "markus",
                            "gala",
                            state: MediaItemState.Processing
                        )
                        .AddGalleryItem("developed", "anna", "gala")
                        .AddGalleryItem("binned-item", "anna", "gala", binnedAt: Evening)
                        .AddGalleryItem("in-binned-album", "anna", "binned")
                        .AddGalleryItem("markus-inbox", "markus")
                        .AddGalleryItem("anna-inbox", "anna")
                        .AddGalleryItem("orphan")
                );
}
