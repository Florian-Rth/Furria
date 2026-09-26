using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class PutMyLoginEmailTests
{
    private const string LoginEmailField = "loginEmail";

    private readonly ApiTestFixture _fixture;

    public PutMyLoginEmailTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MailACodeToTheNewAddress_When_SheAsksToChangeHerLoginEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var newEmail = InvitationSteps.UniqueContactEmail("anna-neu");

        var (response, result) = await AccountSecuritySteps.RequestLoginEmailChangeAsync(
            client,
            newEmail
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            _fixture.TimeProvider.GetUtcNow().AddMinutes(15),
            result.ConfirmationExpiresAt
        );
        var mail = await _fixture.Mailbox.SingleMailToAsync(newEmail, ct);
        Assert.Equal(AccountSecuritySteps.ConfirmationSubject, mail.Subject);
        Assert.Matches("^[0-9]{6}$", mail.ConfirmationCode());
    }

    [Fact]
    public async Task Should_KeepHerLoginEmail_When_TheNewAddressIsNotYetConfirmed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            InvitationSteps.UniqueContactEmail("anna-neu"),
            ct
        );

        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToSignInAs(ctx.Identity.EmailOf("anna"))
            .EmailConfirmationsOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepOnlyTheNewestCodeAlive_When_SheAsksTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            InvitationSteps.UniqueContactEmail("anna-erst"),
            ct
        );
        await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            InvitationSteps.UniqueContactEmail("anna-dann"),
            ct
        );

        await ctx
            .Expected.EmailConfirmationsOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(2)
            .EmailConfirmationsOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAsTaken_When_AnotherAccountSignsInWithTheAddress()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna").AddAccount("bert")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, _) = await AccountSecuritySteps.RequestLoginEmailChangeAsync(
            client,
            ctx.Identity.EmailOf("bert").ToUpperInvariant()
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx
            .Expected.EmailConfirmationsOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAddress_When_ItIsAlreadyHerLoginEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, _) = await AccountSecuritySteps.RequestLoginEmailChangeAsync(
            client,
            $" {ctx.Identity.EmailOf("anna").ToUpperInvariant()} "
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx
            .Expected.EmailConfirmationsOfAccount(ctx.Identity.Accounts.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheRequest_When_TheAddressIsMalformed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna")),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, _) = await AccountSecuritySteps.RequestLoginEmailChangeAsync(
            client,
            "keine-adresse"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var (response, _) = await _fixture
            .CreateClient()
            .PUTAsync<PutMyLoginEmail, PutMyLoginEmailRequest, PutMyLoginEmailResponse>(
                new PutMyLoginEmailRequest
                {
                    LoginEmail = InvitationSteps.UniqueContactEmail("niemand"),
                }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
