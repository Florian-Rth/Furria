using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class RefreshTests : IClassFixture<ApiTestFixture>
{
    private static readonly TimeSpan PastTheGraceWindow = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan PastTheRefreshTokenLifetime = TimeSpan.FromDays(31);

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
    public async Task Should_ReturnTooManyRequests_When_TheSameTokenWasRejectedTooOften()
    {
        await using var host = SignInLimitSteps.HostAllowingFewFailures(_fixture);
        var client = host.CreateClientForwardedFor("203.0.113.70");
        const string staleToken = "stale-refresh-token";

        for (var attempt = 0; attempt < SignInLimitSteps.FailuresAllowed; attempt++)
            await SignInLimitSteps.RefreshAsync(client, staleToken);
        var (response, _) = await SignInLimitSteps.RefreshAsync(client, staleToken);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
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
