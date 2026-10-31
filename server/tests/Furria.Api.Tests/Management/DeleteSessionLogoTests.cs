using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Management;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class DeleteSessionLogoTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public DeleteSessionLogoTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_TakeTheLogoAndItsFilesAway_When_TheKeeperRemovesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var sessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running);
        var logoId = await SessionLogoSteps.RenderedAsync(_fixture, client, sessionId, ct);
        var original = await _fixture.MediaFileOfAsync(logoId, MediaRendition.Original, ct);

        var response = await client.DELETEAsync<DeleteSessionLogo, DeleteSessionLogoRequest>(
            new() { SessionId = sessionId }
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.MediaItem(logoId)
            .ToBeGone()
            .Session(sessionId)
            .ToShowLogo(null)
            .Session(sessionId)
            .ToHaveNumber(53)
            .AssertAsync(ct);
        await _fixture.MediaFilesReapedAsync(ct);
        Assert.False(File.Exists(original));
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheSessionHasNoLogo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);

        var response = await client.DELETEAsync<DeleteSessionLogo, DeleteSessionLogoRequest>(
            new() { SessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running) }
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
