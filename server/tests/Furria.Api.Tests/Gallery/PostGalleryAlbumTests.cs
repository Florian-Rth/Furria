using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Gallery;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Gallery;

public sealed class PostGalleryAlbumTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostGalleryAlbumTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RefuseTheAlbum_When_ItsSessionHasNotBegun()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await client.POSTAsync<
            PostGalleryAlbum,
            PostGalleryAlbumRequest,
            PostGalleryAlbumResponse
        >(
            new()
            {
                Title = "Zukunft",
                Description = null,
                CalendarEntryId = null,
                SessionStartYear = _fixture.CurrentSessionYear + 2,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }
}
