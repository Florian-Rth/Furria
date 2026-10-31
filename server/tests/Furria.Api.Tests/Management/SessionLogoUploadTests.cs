using System.Net;
using Furria.Api.Tests.Media;
using Furria.Core.Media;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Management;

public sealed class SessionLogoUploadTests : IClassFixture<ApiTestFixture>
{
    private const int LogoLength = 4096;
    private const int UnknownSessionId = 999_999;

    private readonly ApiTestFixture _fixture;

    public SessionLogoUploadTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_BecomeTheSessionsLogo_When_TheKeeperUploadsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var sessionId = ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running);

        var logoId = await SessionLogoSteps.UploadAsync(client, sessionId, ct);

        await ctx
            .Expected.MediaItem(logoId)
            .ToBeOwnedBy(MediaOwner.Session(sessionId))
            .MediaItem(logoId)
            .ToAwaitItsRenditions(MediaKind.Photo, "image/jpeg")
            .Session(sessionId)
            .ToShowLogo(logoId)
            .AssertAsync(ct);
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
    public async Task Should_RefuseTheUpload_When_TheCallerMayNotManageTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Member, ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            SessionLogoSteps.SessionOwner(ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running)),
            "sessionslogo.jpg",
            LogoLength,
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheUpload_When_TheSeasonHasNoRecord()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            SessionLogoSteps.SessionOwner(UnknownSessionId),
            "sessionslogo.jpg",
            LogoLength,
            ct
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseACrop_When_TheLogoIsUploaded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);

        var response = await TusUploadSteps.CreateAsync(
            client,
            SessionLogoSteps.SessionOwner(ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running)),
            "sessionslogo.jpg",
            LogoLength,
            "0,0,0.5,0.5",
            ct
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_RejectAVideo_When_ItIsMeantAsTheSessionsLogo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(SessionLogoSeeds.RunningSessionWithKeeper(), ct);
        var client = await ctx.Identity.ClientForAsync(SessionLogoSeeds.Keeper, ct);
        var video = MediaSamples.Mp4(LogoLength);
        var upload = await TusUploadSteps.CreatedAsync(
            client,
            SessionLogoSteps.SessionOwner(ctx.Club.Sessions.IdOf(SessionLogoSeeds.Running)),
            "sessionslogo.mp4",
            video.Length,
            ct
        );

        var response = await TusUploadSteps.PatchAsync(client, upload, 0, video, ct);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }
}
