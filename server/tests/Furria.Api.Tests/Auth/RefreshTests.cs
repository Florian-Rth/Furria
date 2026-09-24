using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class RefreshTests
{
    private static readonly TimeSpan PastTheGraceWindow = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan PastTheRefreshTokenLifetime = TimeSpan.FromDays(31);

    private const string ReplayDetected =
        "Refresh token replay for account {AccountId}, family {TokenFamilyId} revoked";
    private const string DisabledAccountRefreshed =
        "Refresh refused for disabled account {AccountId}, session revoked";

    private readonly ApiTestFixture _fixture;

    public RefreshTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnANewPair_When_TheRefreshTokenIsValid()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);

        var (response, result) = await Post(session.RefreshToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(session.RefreshToken, result.RefreshToken);
        Assert.NotEmpty(result.AccessToken);
    }

    [Fact]
    public async Task Should_RevokeThePresentedTokenAsRotated_When_RefreshSucceeds()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);

        await Post(session.RefreshToken);

        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(1)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.Rotated, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RevokeTheWholeFamily_When_ARotatedTokenIsReplayedAfterTheGraceWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);
        await Post(session.RefreshToken);

        await _fixture.AtLaterTimeAsync(
            PastTheGraceWindow,
            async () =>
            {
                var (response, _) = await Post(session.RefreshToken);

                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
                await ctx
                    .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveActiveCount(0)
                    .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveRevocationCount(RefreshTokenRevocationReason.ReuseDetected, 1)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheFamilyAlive_When_ARotatedTokenIsReplayedInsideTheGraceWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);
        await Post(session.RefreshToken);

        var (response, _) = await Post(session.RefreshToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(1)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.ReuseDetected, 0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SpareTheOtherSession_When_OneFamilyIsRevokedForReuse()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);
        await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        await Post(session.RefreshToken);

        await _fixture.AtLaterTimeAsync(
            PastTheGraceWindow,
            async () =>
            {
                await Post(session.RefreshToken);

                await ctx
                    .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveActiveCount(1)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheRefreshTokenIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await LoggedInAsync(ct);

        var (response, _) = await Post("bm90LWEta25vd24tcmVmcmVzaC10b2tlbi1hdC1hbGwtaGVyZQ");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_LeaveTheFamilyAlone_When_TheRefreshTokenHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);

        await _fixture.AtLaterTimeAsync(
            PastTheRefreshTokenLifetime,
            async () =>
            {
                var (response, _) = await Post(session.RefreshToken);

                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
                await ctx
                    .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
                    .ToHaveRevokedCount(0)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_AuthenticateAnEndpoint_When_TheRotatedAccessTokenIsUsed()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, session) = await LoggedInAsync(ct);

        var (_, refreshed) = await Post(session.RefreshToken);

        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", refreshed.AccessToken);
        var (response, _) = await client.GETAsync<GetMe, GetMeResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Should_RevokeTheFamily_When_TheAccountWasDisabledMidSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);

        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("alice"), ct);
        var (response, _) = await Post(session.RefreshToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AccountDisabled, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreOnlyTheDigest_When_ARefreshTokenIsIssued()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);

        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToStoreNoRawSecret(session.RefreshToken)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("!")]
    [InlineData("ab")]
    [InlineData("token+with/base64=padding")]
    [InlineData("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB")]
    public async Task Should_ReturnUnauthorized_When_TheRefreshTokenIsMalformed(string malformed)
    {
        var ct = TestContext.Current.CancellationToken;
        await LoggedInAsync(ct);

        var (response, _) = await Post(malformed);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheRefreshTokenIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        await LoggedInAsync(ct);

        var (response, _) = await Post("");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_WarnOfTheReplay_When_ARotatedTokenIsReplayedAfterTheGraceWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);
        await Post(session.RefreshToken);
        var mark = _fixture.Logs.Mark();

        await _fixture.AtLaterTimeAsync(PastTheGraceWindow, () => Post(session.RefreshToken));

        var written = Assert.Single(_fixture.Logs.Written(ReplayDetected, mark));
        Assert.Equal(LogEventLevel.Warning, written.Level);
        Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), written.ScalarOf("AccountId"));
        Assert.IsType<Guid>(written.ScalarOf("TokenFamilyId"));
    }

    [Fact]
    public async Task Should_WarnOfNoReplay_When_ARotatedTokenIsReplayedInsideTheGraceWindow()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, session) = await LoggedInAsync(ct);
        await Post(session.RefreshToken);
        var mark = _fixture.Logs.Mark();

        await Post(session.RefreshToken);

        Assert.Empty(_fixture.Logs.Written(ReplayDetected, mark));
    }

    [Fact]
    public async Task Should_WarnOfTheRefusedRefresh_When_TheAccountWasDisabledMidSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("alice"), ct);
        var mark = _fixture.Logs.Mark();

        await Post(session.RefreshToken);

        var written = Assert.Single(_fixture.Logs.Written(DisabledAccountRefreshed, mark));
        Assert.Equal(LogEventLevel.Warning, written.Level);
        Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), written.ScalarOf("AccountId"));
    }

    private async Task<(SeededContext Context, LoginResponse Session)> LoggedInAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );

        return (ctx, session);
    }

    private Task<TestResult<RefreshResponse>> Post(string refreshToken) =>
        _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new() { RefreshToken = refreshToken }
            );
}
