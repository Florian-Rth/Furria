using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Api.Tests.Media;
using Furria.Application.Authorization;
using Furria.Core.Gallery;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class RevokeUploadLinkTests : IClassFixture<ApiTestFixture>
{
    private const int PhotoLength = 4096;

    private readonly ApiTestFixture _fixture;

    public RevokeUploadLinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EndTheLinkAtOnce_When_AnotherManagerRevokesItEarly()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Rosenmontagszug", "jana")),
            ct
        );
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var linkId = ctx.Gallery.UploadLinks.IdOf("zug");

        var response = await manager.POSTAsync<RevokeUploadLink, RevokeUploadLinkRequest>(
            new() { UploadLinkId = linkId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, listed) = await manager.GETAsync<GetUploadLinks, GetUploadLinksResponse>();
        var link = Assert.Single(listed.Links);
        Assert.Equal(UploadLinkState.Revoked, link.State);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow(), link.RevokedAt);
        Assert.Null(link.Token);
    }

    [Fact]
    public async Task Should_StopAnUploadMidway_When_TheLinkIsRevoked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug")),
            ct
        );
        var token = ctx.Gallery.UploadLinkTokens.IdOf("zug");
        var guest = _fixture.CreateClient();
        var upload = await LinkUploadSteps.CreatedAsync(guest, token, "a.jpg", PhotoLength, ct);
        var manager = await ctx.Identity.ClientForAsync("jana", ct);

        await manager.POSTAsync<RevokeUploadLink, RevokeUploadLinkRequest>(
            new() { UploadLinkId = ctx.Gallery.UploadLinks.IdOf("zug") }
        );
        var response = await LinkUploadSteps.PatchAsync(
            guest,
            token,
            upload,
            0,
            MediaSamples.Jpeg(PhotoLength),
            ct
        );

        Assert.Equal(HttpStatusCode.Gone, response.StatusCode);
    }

    [Fact]
    public async Task Should_KeepTheFirstRevocationTime_When_TheLinkIsRevokedTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var revokedAt = _fixture.TimeProvider.GetUtcNow().AddHours(-2);
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Zug", revokedAt: revokedAt)),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var response = await client.POSTAsync<RevokeUploadLink, RevokeUploadLinkRequest>(
            new() { UploadLinkId = ctx.Gallery.UploadLinks.IdOf("zug") }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var (_, listed) = await client.GETAsync<GetUploadLinks, GetUploadLinksResponse>();
        Assert.Equal(revokedAt, Assert.Single(listed.Links).RevokedAt);
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
