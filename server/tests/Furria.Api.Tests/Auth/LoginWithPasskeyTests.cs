using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class LoginWithPasskeyTests
{
    private const string Route = "/api/auth/login/passkey";

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
    public async Task Should_SignHerIn_When_TheAndroidAppAsserts()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);

        var (response, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, authenticator, PasskeySteps.AndroidOrigin)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
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
    public async Task Should_RefuseTheAssertion_When_ItsChallengeHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);
        var attempt = await PasskeySteps.AssertAsync(_fixture, authenticator);

        await _fixture.AtLaterTimeAsync(
            PasskeySteps.PastTheChallengeLifetime,
            async () =>
            {
                var (response, _) = await PasskeySteps.LogInAsync(_fixture, attempt);

                Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
            }
        );

        await ctx.Expected.PasskeyChallenges().ToHaveCount(0).AssertAsync(ct);
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
    public async Task Should_RefuseTheAssertion_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var authenticator = await RegisteredAuthenticatorAsync(ctx, ct);
        var accountId = ctx.Identity.Accounts.IdOf("anna");
        await _fixture.DisableAccountDirectlyAsync(accountId, ct);

        var (response, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await ctx.Expected.RefreshTokensOf(accountId).ToHaveActiveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AnswerTheSameRefusal_When_ThePasskeyIsUnknownOrItsAccountDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        using var registered = await RegisteredAuthenticatorAsync(ctx, ct);
        using var unknown = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(await ctx.Identity.ClientForAsync("berta", ct), unknown);
        await PasskeySteps.RemoveAsync(
            await ctx.Identity.ClientForAsync("berta", ct),
            unknown.PasskeyId
        );
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("anna"), ct);

        var (disabled, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, registered)
        );
        var (removed, _) = await PasskeySteps.LogInAsync(
            _fixture,
            await PasskeySteps.AssertAsync(_fixture, unknown)
        );

        Assert.Equal(HttpStatusCode.Unauthorized, disabled.StatusCode);
        Assert.Equal(removed.StatusCode, disabled.StatusCode);
        Assert.Equal(
            await removed.Content.ReadAsStringAsync(ct),
            await disabled.Content.ReadAsStringAsync(ct)
        );
    }

    [Fact]
    public void Should_BeLimitedPerIp_When_TheRouteIsRegistered()
    {
        Assert.Equal(PasskeySteps.PerIpPolicy, PasskeySteps.RateLimitPolicyOf(_fixture, Route));
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
