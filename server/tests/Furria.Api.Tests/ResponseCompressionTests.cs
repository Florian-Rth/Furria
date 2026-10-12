using System.Net;
using Furria.Application.Authorization;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests;

public sealed class ResponseCompressionTests : IClassFixture<ApiTestFixture>
{
    private const string Brotli = "br";

    private readonly ApiTestFixture _fixture;

    public ResponseCompressionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CompressTheJson_When_AGalleryListIsAskedWithBrotli()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);
        var client = await ctx.Identity.ClientForAsync("markus", ct);
        var request = new HttpRequestMessage(HttpMethod.Get, "api/gallery/inbox");
        request.Headers.AcceptEncoding.ParseAdd(Brotli);

        var response = await client.SendAsync(request, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(Brotli, Assert.Single(response.Content.Headers.ContentEncoding));
    }

    [Fact]
    public async Task Should_ServeTheBytesAsTheyAre_When_AMediaRenditionIsAskedWithBrotli()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(Gallery(), ct);
        var mediaItemId = ctx.Gallery.Items.IdOf("evening");
        byte[] rendition = [.. "RIFF"u8, 0, 0, 0, 0, .. "WEBP"u8];
        await _fixture.PlaceRenditionAsync(mediaItemId, MediaRendition.Medium, rendition, ct);
        var request = new HttpRequestMessage(
            HttpMethod.Get,
            _fixture.SignedMediaUrl(mediaItemId, MediaOwner.Gallery, MediaRendition.Medium)
        );
        request.Headers.AcceptEncoding.ParseAdd(Brotli);

        var response = await _fixture.CreateClient().SendAsync(request, ct);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(response.Content.Headers.ContentEncoding);
        Assert.Equal(rendition, await response.Content.ReadAsByteArrayAsync(ct));
    }

    private static Action<SeedContextBuilder> Gallery() =>
        builder =>
            builder
                .Identity(identity => identity.AddAccount("markus"))
                .Roles(roles =>
                    roles.AddRoleWithHolder(
                        "fotografie",
                        "fotografie-holding",
                        "Fotografie",
                        "markus",
                        FurriaPermissions.GalleryUpload
                    )
                )
                .Gallery(gallery => gallery.AddGalleryItem("evening", "markus"));
}
