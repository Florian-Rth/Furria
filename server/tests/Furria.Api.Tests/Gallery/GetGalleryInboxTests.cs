using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetGalleryInboxTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateTimeOffset Evening = new(2026, 10, 3, 19, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGalleryInboxTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowHerOwnUnplacedItemsInCaptureOrder_When_AnUploaderOpensHerInbox()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Inboxes(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var (response, result) = await client.GETAsync<
            GetGalleryInbox,
            GetGalleryInboxRequest,
            GetGalleryInboxResponse
        >(new());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Gallery.Items.IdOf("markus-early"), ctx.Gallery.Items.IdOf("markus-late")],
            result.Items.Select(item => item.MediaItemId)
        );
    }

    [Fact]
    public async Task Should_RefuseAnotherInbox_When_TheUploaderDoesNotManageTheGallery()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Inboxes(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);

        var (response, _) = await client.GETAsync<
            GetGalleryInbox,
            GetGalleryInboxRequest,
            GetGalleryInboxResponse
        >(new() { Ownerless = true });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ShowTheOwnerlessInbox_When_AManagerAsksForIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Inboxes(), ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, result) = await client.GETAsync<
            GetGalleryInbox,
            GetGalleryInboxRequest,
            GetGalleryInboxResponse
        >(new() { Ownerless = true });

        Assert.Equal(
            [ctx.Gallery.Items.IdOf("orphan")],
            result.Items.Select(item => item.MediaItemId)
        );
    }

    private static Action<SeedContextBuilder> Inboxes() =>
        builder =>
            builder
                .Identity(identity => identity.AddAccount("markus").AddPerson("anna"))
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
                        .AddAlbum("gala", "Prunksitzung")
                        .AddGalleryItem("markus-late", "markus", capturedAt: Evening.AddHours(1))
                        .AddGalleryItem("markus-early", "markus", capturedAt: Evening)
                        .AddGalleryItem("markus-placed", "markus", "gala")
                        .AddGalleryItem("anna-own", "anna")
                        .AddGalleryItem("orphan")
                );
}
