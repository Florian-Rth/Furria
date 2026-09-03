using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class LoginTests
{
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
