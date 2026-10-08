using System.Net;
using System.Text.Json;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PostMyPasskeyTests : IClassFixture<ApiTestFixture>
{
    private const string CredentialField = "credential";

    private static readonly DateTimeOffset ThirdOfOctober = new(
        2026,
        10,
        3,
        9,
        30,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PostMyPasskeyTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_AddHerPasskeyWithADatedName_When_TheAttestationIsValid()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        using var authenticator = new SoftwareAuthenticator();

        await _fixture.AtInstantAsync(
            ThirdOfOctober,
            async () =>
            {
                var client = await ctx.Identity.ClientForAsync("anna", ct);
                var (_, options) = await PasskeySteps.CreationOptionsAsync(client);

                var (response, result) = await PasskeySteps.AddAsync(
                    client,
                    options.ChallengeId,
                    authenticator.Create(options.Options, PasskeySteps.WebOrigin)
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(authenticator.PasskeyId, result.Id);
                Assert.Equal("Passkey vom 3. Okt. 2026", result.Name);
                Assert.Equal(ThirdOfOctober, result.AddedAt);
            }
        );

        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHold(authenticator.CredentialId, "Passkey vom 3. Okt. 2026", ThirdOfOctober)
            .PasskeyChallenges()
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheNameSheChose_When_SheNamedHerPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();

        var passkey = await PasskeySteps.RegisterAsync(client, authenticator, "  Mein Handy ");

        Assert.Equal("Mein Handy", passkey.Name);
    }

    [Fact]
    public async Task Should_SendThePasskeyAddedNotice_When_SheAddedAPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();

        await PasskeySteps.RegisterAsync(client, authenticator);

        var notice = await _fixture.Mailbox.SingleMailToAsync(ctx.Identity.EmailOf("anna"), ct);
        Assert.Equal(AccountSecuritySteps.NoticeSubject, notice.Subject);
        Assert.Contains(PasskeySteps.PasskeyAddedLead, notice.Text, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_AcceptThePasskey_When_TheAndroidAppCreatedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);

        var (response, _) = await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            authenticator.Create(options.Options, PasskeySteps.AndroidOrigin)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheCredentialAndSpendTheChallenge_When_ItComesFromAForeignOrigin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);

        var (response, _) = await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            authenticator.Create(options.Options, PasskeySteps.ForeignOrigin)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CredentialField, ct);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .PasskeyChallenges()
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheChallenge_When_ItIsUsedASecondTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var first = new SoftwareAuthenticator();
        using var second = new SoftwareAuthenticator();
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);
        await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            first.Create(options.Options, PasskeySteps.WebOrigin)
        );

        var (response, _) = await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            second.Create(options.Options, PasskeySteps.WebOrigin)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CredentialField, ct);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheChallenge_When_ItHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        using var authenticator = new SoftwareAuthenticator();
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);
        var credential = authenticator.Create(options.Options, PasskeySteps.WebOrigin);

        await _fixture.AtLaterTimeAsync(
            PasskeySteps.PastTheChallengeLifetime,
            async () =>
            {
                var (response, _) = await PasskeySteps.AddAsync(
                    client,
                    options.ChallengeId,
                    credential
                );

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
                await AccountSecuritySteps.AssertRefusedOnAsync(response, CredentialField, ct);
            }
        );

        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .PasskeyChallenges()
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheChallenge_When_AnotherAccountRequestedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var anna = await ctx.Identity.ClientForAsync("anna", ct);
        var berta = await ctx.Identity.ClientForAsync("berta", ct);
        using var authenticator = new SoftwareAuthenticator();
        var (_, bertasOptions) = await PasskeySteps.CreationOptionsAsync(berta);

        var (response, _) = await PasskeySteps.AddAsync(
            anna,
            bertasOptions.ChallengeId,
            authenticator.Create(bertasOptions.Options, PasskeySteps.WebOrigin)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CredentialField, ct);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .PasskeysOfAccount(ctx.Identity.Accounts.IdOf("berta"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheCredential_When_ItIsAlreadyRegistered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);

        var (response, _) = await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            authenticator.Create(options.Options, PasskeySteps.WebOrigin)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_HerAccountIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);
        await _fixture.DisableAccountDirectlyAsync(ctx.Identity.Accounts.IdOf("anna"), ct);

        var (response, _) = await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            authenticator.Create(options.Options, PasskeySteps.WebOrigin)
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheCredentialIsNotAnObject()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAndBertaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (_, options) = await PasskeySteps.CreationOptionsAsync(client);

        var (response, _) = await PasskeySteps.AddAsync(
            client,
            options.ChallengeId,
            JsonSerializer.SerializeToElement("not a credential")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private Task<SeededContext> ArrangeAnnaAndBertaAsync(CancellationToken ct) =>
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
