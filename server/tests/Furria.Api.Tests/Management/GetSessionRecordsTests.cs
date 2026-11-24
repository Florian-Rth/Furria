using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Api.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class GetSessionRecordsTests : IClassFixture<ApiTestFixture>
{
    private const string Motto = "FURRIA — Der Mittelpunkt des Universums";

    private readonly ApiTestFixture _fixture;

    public GetSessionRecordsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReadTheCutAndTheWholeLogo_When_TheLogoWasUploadedWithACrop()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026, 53, Motto)),
            ct
        );
        var sessionId = ctx.Club.Sessions.IdOf("laufende");
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var logoId = await SessionLogoSteps.UploadAsync(client, sessionId, "0,0.25,1,0.5", ct);
        await _fixture.RenderMediaItemDirectlyAsync(logoId, ct);

        var result = await ReadAsync(client);

        var logo = Assert.IsType<SessionLogoEditingDto>(Assert.Single(result.Sessions).Logo);
        Assert.Equal(1.6, Assert.IsType<SessionLogoDto>(logo.Logo).Aspect, 6);
        var crop = Assert.IsType<PictureCropDto>(logo.Crop);
        Assert.Equal((0.0, 0.25, 1.0, 0.5), (crop.Left, crop.Top, crop.Width, crop.Height));
        Assert.StartsWith(
            _fixture.SignedMediaUrl(
                logoId,
                MediaOwner.Session(sessionId),
                MediaRendition.Uncropped
            ),
            logo.UncroppedUrl
        );
    }

    [Fact]
    public async Task Should_ReadTheLogoAsDeveloping_When_ItsRenditionsAreNotReadyYet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.AddSession("laufende", 2026)),
            ct
        );
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await SessionLogoSteps.UploadAsync(client, ctx.Club.Sessions.IdOf("laufende"), ct);

        var result = await ReadAsync(client);

        var logo = Assert.IsType<SessionLogoEditingDto>(Assert.Single(result.Sessions).Logo);
        Assert.Equal(MediaItemState.Processing, logo.State);
        Assert.Null(logo.Logo);
    }

    private static async Task<GetSessionRecordsResponse> ReadAsync(HttpClient client)
    {
        var (response, result) = await client.GETAsync<
            GetSessionRecords,
            GetSessionRecordsResponse
        >();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
