using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Infrastructure.Identity;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class LoginTests
{
    private const string LoginSucceeded = "Login succeeded for account {AccountId}";
    private const string LoginFailed = "Login failed for {Email}: {LoginFailureReason}";
    private const string AccountLockedOut = "Account {AccountId} locked out until {LockoutEnd}";
    private const int AttemptsUntilLockout = 5;

    private readonly ApiTestFixture _fixture;

    public LoginTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnBothTokens_When_CredentialsAreValid()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var (response, result) = await Post(ctx.Identity.EmailOf("alice"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEmpty(result.AccessToken);
        Assert.NotEmpty(result.RefreshToken);
        Assert.True(result.AccessTokenExpiresAt < result.RefreshTokenExpiresAt);
    }

    [Fact]
    public async Task Should_PersistOneActiveRefreshToken_When_LoginSucceeds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        await Post(ctx.Identity.EmailOf("alice"));

        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(1)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevokedCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_ThePasswordIsWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        var (response, _) = await Post(ctx.Identity.EmailOf("alice"), "Wrong-Password-1!");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheEmailIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await Post("nobody@test.local");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice", disabled: true)),
            ct
        );

        var (response, _) = await Post(ctx.Identity.EmailOf("alice"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_MintNoRefreshToken_When_TheAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice", disabled: true)),
            ct
        );

        await Post(ctx.Identity.EmailOf("alice"));

        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheEmailIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await Post("");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReportTheSignedInAccount_When_LoginSucceeds()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var mark = _fixture.Logs.Mark();

        await Post(ctx.Identity.EmailOf("alice"));

        var written = Assert.Single(_fixture.Logs.Written(LoginSucceeded, mark));
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), written.ScalarOf("AccountId"));
    }

    [Fact]
    public async Task Should_ReportAWrongPassword_When_ThePasswordIsWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var mark = _fixture.Logs.Mark();

        await Post(ctx.Identity.EmailOf("alice"), "Wrong-Password-1!");

        var written = Assert.Single(_fixture.Logs.Written(LoginFailed, mark));
        Assert.Equal(LogEventLevel.Information, written.Level);
        Assert.Equal(ctx.Identity.EmailOf("alice"), written.ScalarOf("Email"));
        Assert.Equal(LoginFailureReason.WrongPassword, written.ScalarOf("LoginFailureReason"));
    }

    [Fact]
    public async Task Should_ReportAnUnknownAccount_When_TheEmailIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var mark = _fixture.Logs.Mark();

        await Post("nobody@test.local");

        var written = Assert.Single(_fixture.Logs.Written(LoginFailed, mark));
        Assert.Equal("nobody@test.local", written.ScalarOf("Email"));
        Assert.Equal(LoginFailureReason.UnknownAccount, written.ScalarOf("LoginFailureReason"));
    }

    [Fact]
    public async Task Should_ReportADisabledAccount_When_TheAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice", disabled: true)),
            ct
        );
        var mark = _fixture.Logs.Mark();

        await Post(ctx.Identity.EmailOf("alice"));

        var written = Assert.Single(_fixture.Logs.Written(LoginFailed, mark));
        Assert.Equal(LoginFailureReason.Disabled, written.ScalarOf("LoginFailureReason"));
    }

    [Fact]
    public async Task Should_WarnOfTheLockoutOnce_When_TheLastAllowedAttemptFails()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var mark = _fixture.Logs.Mark();

        for (var attempt = 0; attempt <= AttemptsUntilLockout; attempt++)
            await Post(ctx.Identity.EmailOf("alice"), "Wrong-Password-1!");

        var written = Assert.Single(_fixture.Logs.Written(AccountLockedOut, mark));
        Assert.Equal(LogEventLevel.Warning, written.Level);
        Assert.Equal(ctx.Identity.Accounts.IdOf("alice"), written.ScalarOf("AccountId"));
        var lastAttempt = _fixture.Logs.Written(LoginFailed, mark)[^1];
        Assert.Equal(LoginFailureReason.LockedOut, lastAttempt.ScalarOf("LoginFailureReason"));
    }

    private Task<TestResult<LoginResponse>> Post(
        string email,
        string password = ApiTestFixture.SeededAccountPassword
    ) =>
        _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new() { Email = email, Password = password }
            );
}
