using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class ResetPasswordTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public ResetPasswordTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_LetHerLogInWithTheNewPassword_When_TheResetLinkIsLive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        var response = await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var login = await ctx.Identity.LogInAsync(aliceEmail, SignedOutMailSteps.NewPassword, ct);
        Assert.NotEmpty(login.AccessToken);
        var (oldPassword, _) = await _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new LoginRequest
                {
                    Email = aliceEmail,
                    Password = ApiTestFixture.SeededAccountPassword,
                }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, oldPassword.StatusCode);
    }

    [Fact]
    public async Task Should_EndEverySession_When_ThePasswordIsReset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var session = await ctx.Identity.LogInAsync(
            aliceEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);

        await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        var (refresh, _) = await _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new RefreshRequest { RefreshToken = session.RefreshToken }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, refresh.StatusCode);
        await ctx
            .Expected.RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("alice"))
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseNeutrally_When_TheResetLinkWasAlreadyUsed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(
            _fixture,
            ctx.Identity.EmailOf("alice"),
            ct
        );
        await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);

        var used = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            reset,
            "Noch-ein-Passwort-2026!"
        );
        var unknown = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            SignedOutMailSteps.UnknownReset()
        );

        Assert.Equal(HttpStatusCode.BadRequest, used.StatusCode);
        Assert.Equal(await RefusalOnAsync(unknown, ct), await RefusalOnAsync(used, ct));
    }

    [Fact]
    public async Task Should_RefuseNeutrally_When_TheAccountBecameTheManagingLogin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("alice")),
            ct
        );
        var aliceEmail = ctx.Identity.EmailOf("alice");
        var reset = await SignedOutMailSteps.RequestResetAndReadItAsync(_fixture, aliceEmail, ct);
        await _fixture.DeleteAccountDirectlyAsync(_fixture.ManagingLogin.AccountId, ct);
        await _fixture.RunManagingLoginSeederAsync(
            new ManagingLoginOptions
            {
                Email = aliceEmail,
                Password = ApiTestFixture.SeededAccountPassword,
            },
            ct
        );

        var response = await SignedOutMailSteps.ResetPasswordAsync(_fixture.CreateClient(), reset);
        var unknown = await SignedOutMailSteps.ResetPasswordAsync(
            _fixture.CreateClient(),
            SignedOutMailSteps.UnknownReset()
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(await RefusalOnAsync(unknown, ct), await RefusalOnAsync(response, ct));
        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                aliceEmail,
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    private static async Task<Refusal> RefusalOnAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.NotNull(payload);
        var (field, messages) = Assert.Single(payload.Errors);

        return new Refusal(field, Assert.Single(messages));
    }

    private sealed record Refusal(string Field, string Message);
}
