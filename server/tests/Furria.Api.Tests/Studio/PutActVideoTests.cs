using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.Studio;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.Studio;

[SeedsAliases]
public sealed class PutActVideoTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutActVideoTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [InlineData("  Seite ", "Seite")]
    [InlineData("   ", null)]
    [InlineData(null, null)]
    public async Task Should_StoreTheTrimmedName_When_AnEditorNamesTheVideo(
        string? name,
        string? expected
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(GardeWithDancers(_fixture.Today), ct);
        var actId = await GardetanzAsync(ctx, ct);
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);
        var videoId = await AddVideoAsync(admin, actId, await UploadVideoAsync(admin, actId, ct));

        var response = await admin.PUTAsync<PutActVideo, PutActVideoRequest>(
            new()
            {
                ActId = actId,
                VideoId = videoId,
                Name = name,
            }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(expected, (await VideoInStudioAsync(admin, actId, videoId)).Name);
    }
}
