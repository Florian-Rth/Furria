using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Infrastructure.Identity;
using Furria.Tests.Common.Fixtures;
using Serilog.Events;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class LoginTests : IClassFixture<ApiTestFixture>
{
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

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_HerAddressFailedTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        await using var host = SignInLimitSteps.HostAllowingFewFailures(_fixture);
        var client = host.CreateClientForwardedFor("203.0.113.50");

        await SignInLimitSteps.FailToLogInAsync(client, ctx.Identity.EmailOf("alice"));
        var (response, _) = await SignInLimitSteps.LogInAsync(
            client,
            ctx.Identity.EmailOf("alice"),
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
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
