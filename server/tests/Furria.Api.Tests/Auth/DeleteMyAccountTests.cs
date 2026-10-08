using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Invitations;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class DeleteMyAccountTests
{
    private const string PasswordField = "password";
    private const string PasskeyField = "passkey";

    private readonly ApiTestFixture _fixture;

    public DeleteMyAccountTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DeleteHerAccount_When_ThePasswordIsRight()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var response = await AccountSecuritySteps.DeleteAccountAsync(
            client,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.AccountOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToNotExist()
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveActiveCount(0)
            .RefreshTokensOf(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveRevokedCount(0)
            .AssertAsync(ct);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                ctx.Identity.EmailOf("anna"),
                ApiTestFixture.SeededAccountPassword
            )
        );
    }

    [Fact]
    public async Task Should_KeepHerPersonAndMemberships_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        await AccountSecuritySteps.DeleteAccountAsync(client, ApiTestFixture.SeededAccountPassword);

        await ctx
            .Expected.Person(annaId)
            .ToHaveName("Anna", "Muster")
            .MembershipsOfPerson(annaId)
            .ToHaveCount(1)
            .Membership(ctx.Identity.Memberships.IdOf("anna-mitglied"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheDeletionWithHerAsActor_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        await AccountSecuritySteps.DeleteAccountAsync(client, ApiTestFixture.SeededAccountPassword);

        await ctx
            .Expected.AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Deleted)
            .AccountEventsOfPerson(annaId)
            .ToHaveLatestActor(annaId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_VoidHerLiveInvitation_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.IssueRecoveryAsync(manager, annaId);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        await AccountSecuritySteps.DeleteAccountAsync(client, ApiTestFixture.SeededAccountPassword);

        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropHerPendingLoginEmailChange_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            InvitationSteps.UniqueContactEmail("anna-neu"),
            ct
        );

        await AccountSecuritySteps.DeleteAccountAsync(client, ApiTestFixture.SeededAccountPassword);

        await ctx
            .Expected.EmailConfirmationsOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveHerWithoutAccess_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        await AccountSecuritySteps.DeleteAccountAsync(client, ApiTestFixture.SeededAccountPassword);

        var (response, result) = await manager.GETAsync<
            GetPersonAccessState,
            GetPersonAccessStateRequest,
            GetPersonAccessStateResponse
        >(new GetPersonAccessStateRequest { PersonId = ctx.Identity.People.IdOf("anna") });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AccountAccessState.NoAccess, result.State);
    }

    [Fact]
    public async Task Should_RefuseOnThePassword_When_ItIsWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var response = await AccountSecuritySteps.DeleteAccountAsync(
            client,
            AccountSecuritySteps.WrongPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, PasswordField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToExist()
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveKindsInOrder()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LockHerOut_When_ThePasswordWasWrongFiveTimes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        for (var attempt = 0; attempt < AccountSecuritySteps.LockoutThreshold; attempt++)
            await AccountSecuritySteps.DeleteAccountAsync(
                client,
                AccountSecuritySteps.WrongPassword
            );

        var response = await AccountSecuritySteps.DeleteAccountAsync(
            client,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, PasswordField, ct);
        await ctx.Expected.Account(ctx.Identity.Accounts.IdOf("anna")).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetAManagerInviteHerByHand_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, bertaId) = await RedeemedAndDeletedAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await manager.POSTAsync<
            PostPersonInvitation,
            PostPersonInvitationRequest,
            PostPersonInvitationResponse
        >(new PostPersonInvitationRequest { PersonId = bertaId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.InvitationsOfPerson(bertaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(bertaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SkipHerInABulkInvitation_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, bertaId) = await RedeemedAndDeletedAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        await InvitationRoundSteps.InviteAllAsync(manager);

        await ctx
            .Expected.InvitationsOfPerson(bertaId)
            .ToHaveCount(1)
            .InvitationsOfPerson(bertaId)
            .ToHaveLiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteHerPasskeys_When_SheDeletedHerAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);

        await AccountSecuritySteps.DeleteAccountAsync(client, ApiTestFixture.SeededAccountPassword);

        await ctx
            .Expected.PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteHerAccount_When_SheProvesItWithHerPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);

        var response = await PasskeySteps.DeleteAccountAsync(
            client,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.AccountOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToNotExist()
            .PasskeysOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveKindsInOrder(AccountEventKind.Deleted)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DeleteHerAccount_When_SheProvesItWithHerPasskeyWhileLockedOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);
        for (var attempt = 0; attempt < AccountSecuritySteps.LockoutThreshold; attempt++)
            await AccountSecuritySteps.DeleteAccountAsync(
                client,
                AccountSecuritySteps.WrongPassword
            );

        var response = await PasskeySteps.DeleteAccountAsync(
            client,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.AccountOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseOnThePasskey_When_TheAssertionIsSomeoneElses()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
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
        var anna = await ctx.Identity.ClientForAsync("anna", ct);
        using var bertasAuthenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(
            await ctx.Identity.ClientForAsync("berta", ct),
            bertasAuthenticator
        );

        var response = await PasskeySteps.DeleteAccountAsync(
            anna,
            await PasskeySteps.AssertAsync(_fixture, bertasAuthenticator)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, PasskeyField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToExist()
            .Account(ctx.Identity.Accounts.IdOf("berta"))
            .ToExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseOnThePasskey_When_TheAssertionsChallengeWasUsedBefore()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(client, authenticator);
        var attempt = await PasskeySteps.AssertAsync(_fixture, authenticator);
        await PasskeySteps.LogInAsync(_fixture, attempt);

        var response = await PasskeySteps.DeleteAccountAsync(client, attempt);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, PasskeyField, ct);
        await ctx.Expected.Account(ctx.Identity.Accounts.IdOf("anna")).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheManagingLoginDeletesItself()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var response = await AccountSecuritySteps.DeleteAccountAsync(
            client,
            ApiTestFixture.ManagingLoginPassword
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.Account(_fixture.ManagingLogin.AccountId)
            .ToBeTheManagingLogin()
            .AssertAsync(ct);
    }

    private Task<SeededContext> ArrangeAnnaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddMembership("anna-mitglied", "anna", _fixture.Today.AddYears(-2))
                        .AddAccount("anna")
                ),
            ct
        );

    private async Task<(SeededContext Context, int BertaId)> RedeemedAndDeletedAsync(
        CancellationToken ct
    )
    {
        var bertaEmail = InvitationSteps.UniqueContactEmail("berta");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("berta", "Berta", bertaEmail, _fixture.Today)
                ),
            ct
        );
        var bertaId = ctx.Identity.People.IdOf("berta");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            bertaId,
            bertaEmail,
            ct
        );
        var (_, redemption) = await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);
        var berta = InvitationSteps.SignedInClient(_fixture, redemption);

        var deleted = await AccountSecuritySteps.DeleteAccountAsync(
            berta,
            InvitationSteps.ValidPassword
        );
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        return (ctx, bertaId);
    }
}
