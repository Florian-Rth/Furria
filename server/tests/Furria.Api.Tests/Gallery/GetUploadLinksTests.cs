using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
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
