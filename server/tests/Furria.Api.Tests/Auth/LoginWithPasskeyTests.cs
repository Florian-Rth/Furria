using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class LoginWithPasskeyTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public LoginWithPasskeyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SignHerIn_When_TheAssertionIsValid()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);

        var (response, session) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var (me, result) = await AccountSecuritySteps
            .ClientWith(_fixture, session.AccessToken)
            .GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal(ctx.Identity.Accounts.IdOf("anna"), result.AccountId);
        Assert.Equal(
            HttpStatusCode.OK,
            (await AccountSecuritySteps.RefreshAsync(_fixture, session.RefreshToken)).StatusCode
        );
        await ctx.Expected.PasskeyChallenges().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAssertion_When_ItsChallengeWasUsedBefore()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);
        var attempt = await PasskeySteps.AssertAsync(_fixture, authenticator);
        await PasskeySteps.LogInAsync(_fixture, attempt);

        var (response, _) = await PasskeySteps.LogInAsync(_fixture, attempt);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheAssertion_When_ItsChallengeWasIssuedForACreation()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (_, creation) = await PasskeySteps.CreationOptionsAsync(client);
        var (_, request) = await PasskeySteps.RequestOptionsAsync(_fixture);

        var (response, _) = await PasskeySteps.LogInAsync(
            _fixture,
            new PasskeyAssertionAttempt(
                creation.ChallengeId,
                authenticator.Assert(request.Options, PasskeySteps.WebOrigin)
            )
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheAssertion_When_ItComesFromAForeignOrigin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);

        var (response, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, authenticator, PasskeySteps.ForeignOrigin)
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx.Expected.PasskeyChallenges().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignHerIn_When_WrongPasswordsLockedHerOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);
        for (var attempt = 0; attempt < AccountSecuritySteps.LockoutThreshold; attempt++)
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                AccountSecuritySteps.WrongPassword
            );

        var (response, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(
            HttpStatusCode.Unauthorized,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                ApiTestFixture.SeededAccountPassword
            )
        );
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private async Task<SoftwareAuthenticator> RegisteredAuthenticatorAsync(
        SeededContext ctx,
        CancellationToken ct
    )
    {
        var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(
            await ctx.Identity.ClientForAsync("anna", ct),
            authenticator
        );
        return authenticator;
    }

    private Task<SeededContext> ArrangeAnnaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddAccount("anna")
                        .AddPerson("berta", "Berta", "Beispiel")
                        .AddAccount("berta")
                ),
            ct
        );
}
