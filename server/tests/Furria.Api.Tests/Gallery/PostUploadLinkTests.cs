using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Application.Authorization;
using Furria.Core.Gallery;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PostUploadLinkTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostUploadLinkTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_OpenALinkForSevenDays_When_APhotographerCreatesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Photographer(), ct);
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (response, created) = await client.POSTAsync<
            PostUploadLink,
            PostUploadLinkRequest,
            PostUploadLinkResponse
        >(new() { Title = "  Rosenmontagszug  " });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddDays(7), created.ExpiresAt);
        var (_, listed) = await client.GETAsync<GetUploadLinks, GetUploadLinksResponse>();
        var link = Assert.Single(listed.Links);
        Assert.Equal(created.UploadLinkId, link.UploadLinkId);
        Assert.Equal("Rosenmontagszug", link.Title);
        Assert.Equal(UploadLinkState.Open, link.State);
        Assert.Equal(created.Token, link.Token);
        Assert.Equal(ctx.Identity.People.IdOf("jana"), link.CreatedBy?.PersonId);
    }

    [Fact]
    public async Task Should_HandOutADifferentUnguessableToken_When_TwoLinksAreCreated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Photographer(), ct);
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (_, first) = await client.POSTAsync<
            PostUploadLink,
            PostUploadLinkRequest,
            PostUploadLinkResponse
        >(new() { Title = "Prunksitzung" });
        var (_, second) = await client.POSTAsync<
            PostUploadLink,
            PostUploadLinkRequest,
            PostUploadLinkResponse
        >(new() { Title = "Prunksitzung" });

        Assert.NotEqual(first.Token, second.Token);
        Assert.Equal(UploadLink.TokenLength, first.Token.Length);
    }

    [Fact]
    public async Task Should_RefuseTheLink_When_TheTitleIsBlank()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Photographer(), ct);
        var client = await ctx.Identity.ClientForAsync("jana", ct);

        var (response, _) = await client.POSTAsync<
            PostUploadLink,
            PostUploadLinkRequest,
            PostUploadLinkResponse
        >(new() { Title = "   " });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
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
