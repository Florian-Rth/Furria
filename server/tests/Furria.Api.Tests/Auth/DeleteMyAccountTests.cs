using System.Net;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class DeleteMyAccountTests : IClassFixture<ApiTestFixture>
{
    private const string PasswordField = "password";

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
}
