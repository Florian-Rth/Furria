using System.Net;
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
    private const string UnknownToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    private readonly ApiTestFixture _fixture;

    public LookUpUploadLinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NameTheOccasionAndItsEnd_When_AGuestOpensAnOpenLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery => gallery.AddUploadLink("zug", "Rosenmontagszug")),
            ct
        );

        var (response, result) = await _fixture
            .CreateClient()
            .POSTAsync<LookUpUploadLink, LookUpUploadLinkRequest, LookUpUploadLinkResponse>(
                new() { Token = ctx.Gallery.UploadLinkTokens.IdOf("zug") }
            );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Rosenmontagszug", result.Title);
        Assert.Equal(UploadLinkState.Open, result.State);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddDays(7), result.ExpiresAt);
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

    [Fact]
    public async Task Should_SayTheLinkWasEnded_When_ItWasRevoked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            Photographer(gallery =>
                gallery.AddUploadLink(
                    "zug",
                    "Rosenmontagszug",
                    revokedAt: _fixture.TimeProvider.GetUtcNow()
                )
            ),
            ct
        );

        var (_, result) = await _fixture
            .CreateClient()
            .POSTAsync<LookUpUploadLink, LookUpUploadLinkRequest, LookUpUploadLinkResponse>(
                new() { Token = ctx.Gallery.UploadLinkTokens.IdOf("zug") }
            );

        Assert.Equal(UploadLinkState.Revoked, result.State);
    }

    [Theory]
    [InlineData(UnknownToken)]
    [InlineData("not-a-token")]
    public async Task Should_FindNoLink_When_TheTokenIsNotOneTheClubHandedOut(string token)
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(Photographer(gallery => gallery.AddUploadLink("zug", "Zug")), ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<LookUpUploadLink, LookUpUploadLinkRequest, LookUpUploadLinkResponse>(
                new() { Token = token }
            );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
