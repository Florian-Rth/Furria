using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class SessionLogoUploadTests : IClassFixture<ApiTestFixture>
{
    private static readonly PictureCrop MarkCut = new(0.3, 0.3, 0.4, 0.4);

    private readonly ApiTestFixture _fixture;

    public SessionLogoUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteTheFormerLogo_When_TheSessionGetsANewOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var sessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running);
        var formerId = await SessionLogoSteps.UploadAsync(client, sessionId, ct);

        var logoId = await SessionLogoSteps.UploadAsync(client, sessionId, ct);

        await ctx
            .Expected.Session(sessionId)
            .ToShowLogo(logoId)
            .MediaItem(formerId)
            .ToBeGone()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheTransparency_When_AFreeStandingPngLogoIsRendered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var sessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running);
        var logoId = await SessionLogoSteps.UploadPngAsync(
            client,
            sessionId,
            SessionLogoSteps.TransparentPngWithAMark(1200, 800),
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(logoId).ToBeReady(1200, 800).AssertAsync(ct);
        var medium = await _fixture.MediaFileOfAsync(logoId, MediaRendition.Medium, ct);
        Assert.Equal((0.0, 255.0), SessionLogoSteps.AlphaOf(medium));
    }

    [Fact]
    public async Task Should_RenderOnlyTheCutInItsOwnShape_When_TheLogoIsCutToItsMark()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var sessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running);
        var logoId = await SessionLogoSteps.UploadPngAsync(
            client,
            sessionId,
            SessionLogoSteps.TransparentPngWithAMark(1200, 800),
            MarkCut.Token,
            ct
        );

        await _fixture.RunMediaWorkerAsync(ct);

        await ctx.Expected.MediaItem(logoId).ToBeReady(1200, 800).AssertAsync(ct);
        var medium = await _fixture.MediaFileOfAsync(logoId, MediaRendition.Medium, ct);
        Assert.Equal((255.0, 255.0), SessionLogoSteps.AlphaOf(medium));
        Assert.Equal(1.5, SessionLogoSteps.AspectOf(medium), 2);
    }
}
