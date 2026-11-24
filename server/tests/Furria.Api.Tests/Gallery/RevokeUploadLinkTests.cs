using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Api.Tests.Media;
using Furria.Application.Authorization;
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
