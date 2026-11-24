using System.Net;
using Furria.Api.Endpoints.Auth;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class ConfirmMyLoginEmailTests : IClassFixture<ApiTestFixture>
{
    private const string CodeField = "code";
    private const string LoginEmailField = "loginEmail";
    private const int NewerCodeRequestLimit = 3;

    private readonly ApiTestFixture _fixture;

    public ConfirmMyLoginEmailTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ChangeHerLoginEmail_When_TheCodeMatches()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var newEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        var code = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            newEmail,
            ct
        );

        var response = await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToSignInAs(newEmail)
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveKindsInOrder(AccountEventKind.LoginEmailChanged)
            .AccountEventsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveLatestActor(ctx.Identity.People.IdOf("anna"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheCode_When_ItHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("anna"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var newEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        var code = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            AccountSecuritySteps.ClientWith(_fixture, session.AccessToken),
            newEmail,
            ct
        );

        HttpResponseMessage? response = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(15),
            async () =>
            {
                var fresh = await ctx.Identity.LogInAsync(
                    ctx.Identity.EmailOf("anna"),
                    ApiTestFixture.SeededAccountPassword,
                    ct
                );
                response = await AccountSecuritySteps.ConfirmLoginEmailAsync(
                    AccountSecuritySteps.ClientWith(_fixture, fresh.AccessToken),
                    code
                );
            }
        );

        Assert.NotNull(response);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CodeField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToSignInAs(ctx.Identity.EmailOf("anna"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheEarlierCode_When_SheAskedForANewerOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var earlier = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            InvitationSteps.UniqueContactEmail("anna-erst"),
            ct
        );
        var newer = earlier;
        for (var request = 0; request < NewerCodeRequestLimit && newer == earlier; request++)
            newer = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
                _fixture,
                client,
                InvitationSteps.UniqueContactEmail("anna-dann"),
                ct
            );
        Assert.NotEqual(earlier, newer);

        var response = await AccountSecuritySteps.ConfirmLoginEmailAsync(client, earlier);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, CodeField, ct);
    }

    [Fact]
    public async Task Should_RefuseAsTaken_When_AnotherAccountTookTheAddressMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("anna").AddAccount("bert")),
            ct
        );
        var anna = await ctx.Identity.ClientForAsync("anna", ct);
        var bert = await ctx.Identity.ClientForAsync("bert", ct);
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var annaCode = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            anna,
            sharedEmail,
            ct
        );
        await AccountSecuritySteps.RequestLoginEmailChangeAsync(bert, sharedEmail);
        var toShared = await _fixture.Mailbox.MailsToAsync(sharedEmail, 2, ct);
        await AccountSecuritySteps.ConfirmLoginEmailAsync(bert, toShared[1].ConfirmationCode());

        var response = await AccountSecuritySteps.ConfirmLoginEmailAsync(anna, annaCode);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToSignInAs(ctx.Identity.EmailOf("anna"))
            .Account(ctx.Identity.Accounts.IdOf("bert"))
            .ToSignInAs(sharedEmail)
            .AssertAsync(ct);
    }

    private Task<SeededContext> ArrangeAnnaAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            "anna@kontakt.test",
                            "0170 1234567",
                            "Am Anger 3",
                            "99706",
                            "Sondershausen"
                        )
                        .AddAccount("anna")
                ),
            ct
        );
}
