using System.Net;
using System.Net.Http.Headers;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class LogoutTests
{
    private readonly ApiTestFixture _fixture;

    public LogoutTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RevokeTheSession_When_TheRefreshTokenBelongsToTheCaller()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, session) = await LoggedInAsync(ct);

        var response = await Post(session, session.RefreshToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.LoggedOut, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RejectARefresh_When_TheSessionWasLoggedOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, session) = await LoggedInAsync(ct);
        await Post(session, session.RefreshToken);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new() { RefreshToken = session.RefreshToken }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNoContent_When_TheRefreshTokenIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, session) = await LoggedInAsync(ct);

        var response = await Post(session, "bm90LWEta25vd24tcmVmcmVzaC10b2tlbi1hdC1hbGwtaGVyZQ");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_LeaveTheSessionAlive_When_TheRefreshTokenBelongsToAnotherAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddAccount("alice").AddAccount("mallory")),
            ct
        );

        var alice = await LogInAsync(ctx, "alice", ct);
        var mallory = await LogInAsync(ctx, "mallory", ct);

        await Post(mallory, alice.RefreshToken);

        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNoContent_When_TheRefreshTokenIsMalformed()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, session) = await LoggedInAsync(ct);

        var response = await Post(session, "token+with/base64=padding");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, session) = await LoggedInAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<Logout, LogoutRequest, EmptyResponse>(
                new() { RefreshToken = session.RefreshToken }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task<(SeededContext Context, LoginResponse Session)> LoggedInAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );

        return (ctx, await LogInAsync(ctx, "alice", ct));
    }

    private static Task<LoginResponse> LogInAsync(
        SeededContext ctx,
        string alias,
        CancellationToken ct
    ) =>
        ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf(alias),
            ApiTestFixture.SeededAccountPassword,
            ct
        );

    private async Task<HttpResponseMessage> Post(LoginResponse session, string refreshToken)
    {
        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            session.AccessToken
        );

        var (response, _) = await client.POSTAsync<Logout, LogoutRequest, EmptyResponse>(
            new() { RefreshToken = refreshToken }
        );

        return response;
    }
}
