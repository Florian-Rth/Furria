using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetUploadLinkInboxTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetUploadLinkInboxTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowOnlyWhatCameThroughThatLink_When_AManagerOpensItsInbox()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery
                    .AddUploadLink("zug", "Rosenmontagszug")
                    .AddUploadLink("ball", "Hausball")
                    .AddLinkItem("zug-1", "zug", uploaderName: "Oma Gerda")
                    .AddLinkItem("ball-1", "ball")
                    .AddGalleryItem("jana-own", "jana")
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (response, result) = await client.GETAsync<
            GetUploadLinkInbox,
            GetUploadLinkInboxRequest,
            GetUploadLinkInboxResponse
        >(new() { UploadLinkId = ctx.Gallery.UploadLinks.IdOf("zug") });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var item = Assert.Single(result.Items);
        Assert.Equal(ctx.Gallery.Items.IdOf("zug-1"), item.MediaItemId);
        Assert.Equal("Oma Gerda", item.UploaderName);
    }

    [Fact]
    public async Task Should_KeepLinkUploadsOutOfTheOwnerlessInbox_When_AManagerOpensIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery.AddUploadLink("zug", "Zug").AddLinkItem("zug-1", "zug")
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (_, result) = await client.GETAsync<
            GetGalleryInbox,
            GetGalleryInboxRequest,
            GetGalleryInboxResponse
        >(new() { Ownerless = true });

        Assert.Empty(result.Items);
    }

    private static Action<SeedContextBuilder> Photographer(
        Action<GallerySeedBuilder>? gallery = null
    ) =>
        builder =>
            builder
                .Gallery(gallery ?? (_ => { }))
                .Identity(identity => identity.AddAccount("jana").AddAccount("markus"))
                .Roles(roles =>
                    roles
                        .AddRoleWithHolder(
                            "fotografie",
                            "fotografie-holding",
                            "Fotografie",
                            "jana",
                            FurriaPermissions.GalleryManage
                        )
                        .AddRoleWithHolder(
                            "galerie",
                            "galerie-holding",
                            "Galerie",
                            "markus",
                            FurriaPermissions.GalleryUpload
                        )
                );
}
