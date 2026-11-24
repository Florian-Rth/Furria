using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Gallery;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class LookUpUploadLinkTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public LookUpUploadLinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SayTheLinkExpired_When_SevenDaysHavePassed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Rosenmontagszug")),
            ct
        );
        var token = ctx.Gallery.UploadLinkTokens.IdOf("zug");
        LookUpUploadLinkResponse? result = null;

        await _fixture.AtLaterTimeAsync(
            UploadLink.Lifetime,
            async () =>
                (_, result) = await _fixture
                    .CreateClient()
                    .POSTAsync<LookUpUploadLink, LookUpUploadLinkRequest, LookUpUploadLinkResponse>(
                        new() { Token = token }
                    )
        );

        Assert.Equal(UploadLinkState.Expired, result?.State);
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
