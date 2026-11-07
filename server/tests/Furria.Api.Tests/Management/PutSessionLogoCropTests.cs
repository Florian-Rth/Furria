using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class PutSessionLogoCropTests : IClassFixture<ApiTestFixture>
{
    private static readonly PictureCrop NewCut = new(0.1, 0.2, 0.6, 0.5);

    private readonly ApiTestFixture _fixture;

    public PutSessionLogoCropTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RenderTheLogoAnewInTheNewCut_When_TheKeeperRecropsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var sessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running);
        var logoId = await SessionLogoSteps.RenderedAsync(_fixture, client, sessionId, ct);

        var response = await client.PUTAsync<PutSessionLogoCrop, PutSessionLogoCropRequest>(
            RecropOf(sessionId)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MediaItem(logoId)
            .ToBeCroppedTo(NewCut)
            .MediaItem(logoId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheSessionHasNoLogo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);

        var response = await client.PUTAsync<PutSessionLogoCrop, PutSessionLogoCropRequest>(
            RecropOf(ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running))
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static PutSessionLogoCropRequest RecropOf(int sessionId) =>
        new()
        {
            SessionId = sessionId,
            Left = NewCut.Left,
            Top = NewCut.Top,
            Width = NewCut.Width,
            Height = NewCut.Height,
        };
}
