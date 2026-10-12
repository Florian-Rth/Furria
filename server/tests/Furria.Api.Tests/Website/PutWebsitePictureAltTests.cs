using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.WebsitePictures;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Website;

public sealed class PutWebsitePictureAltTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutWebsitePictureAltTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("  Die Garde auf der Bühne ", "Die Garde auf der Bühne")]
    [InlineData("   ", null)]
    [InlineData(null, null)]
    public async Task Should_StoreWhatThePictureShows_When_ThePublisherDescribesIt(
        string? alt,
        string? stored
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);
        var pictureId = await WebsitePictureSteps.UploadAsync(
            client,
            "club.story",
            1,
            WebsitePictureSteps.Landscape,
            ct
        );

        var response = await DescribeAsync(client, "club.story", alt);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.WebsitePicture("club.story", 1)
            .ToBeFilledBy(pictureId, WebsitePictureSteps.Landscape, stored)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerNotFound_When_ThePositionIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(builder => builder.WithGalleryPublisher(), ct);
        var client = await ctx.Identity.ClientForAsync(WebsitePictureSeeds.Publisher, ct);

        var response = await DescribeAsync(client, "club.story", "Vereinsfoto");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static Task<HttpResponseMessage> DescribeAsync(
        HttpClient client,
        string slotKey,
        string? alt
    ) =>
        client.PUTAsync<PutWebsitePictureAlt, PutWebsitePictureAltRequest>(
            new()
            {
                SlotKey = slotKey,
                Position = 1,
                Alt = alt,
            }
        );
}
