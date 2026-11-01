using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Gallery;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class GetUploadLinksTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetUploadLinksTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TellOpenExpiredAndRevokedLinksApart_When_AManagerListsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery
                    .AddUploadLink("zug", "Rosenmontagszug", "jana")
                    .AddUploadLink("ball", "Hausball", "jana", expiresAt: now.AddSeconds(-1))
                    .AddUploadLink("sitzung", "Prunksitzung", revokedAt: now.AddHours(-1))
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (response, result) = await client.GETAsync<GetUploadLinks, GetUploadLinksResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var states = result.Links.ToDictionary(link => link.Title, link => link.State);
        Assert.Equal(UploadLinkState.Open, states["Rosenmontagszug"]);
        Assert.Equal(UploadLinkState.Expired, states["Hausball"]);
        Assert.Equal(UploadLinkState.Revoked, states["Prunksitzung"]);
    }

    [Fact]
    public async Task Should_ShowTheTokenOnlyOfAnOpenLink_When_AManagerListsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery
                    .AddUploadLink("zug", "Rosenmontagszug")
                    .AddUploadLink("ball", "Hausball", expiresAt: now.AddSeconds(-1))
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (_, result) = await client.GETAsync<GetUploadLinks, GetUploadLinksResponse>();

        var tokens = result.Links.ToDictionary(link => link.Title, link => link.Token);
        Assert.Equal(ctx.Gallery.UploadLinkTokens.IdOf("zug"), tokens["Rosenmontagszug"]);
        Assert.Null(tokens["Hausball"]);
    }

    [Fact]
    public async Task Should_CountWhatWaitsInEachLinksInbox_When_AManagerListsThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery
                    .AddUploadLink("zug", "Rosenmontagszug")
                    .AddUploadLink("ball", "Hausball")
                    .AddLinkItem("zug-1", "zug")
                    .AddLinkItem("zug-2", "zug")
                    .AddLinkItem("zug-video", "zug", kind: MediaKind.Video)
                    .AddLinkItem("ball-1", "ball")
            ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (_, result) = await client.GETAsync<GetUploadLinks, GetUploadLinksResponse>();

        var zug = result.Links.Single(link => link.Title == "Rosenmontagszug");
        Assert.Equal((2, 1), (zug.InboxPhotos, zug.InboxVideos));
        var ball = result.Links.Single(link => link.Title == "Hausball");
        Assert.Equal((1, 0), (ball.InboxPhotos, ball.InboxVideos));
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
