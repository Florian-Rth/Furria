using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class ConfirmMyLoginEmailTests
{
    private const string CodeField = "code";
    private const string LoginEmailField = "loginEmail";
    private const string LoginEmailChangedLead = "Diese Adresse gilt dafür nicht mehr.";
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
    public async Task Should_SignHerInWithTheNewAddressOnly_When_HerLoginEmailChanged()
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

        await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);

        Assert.Equal(
            HttpStatusCode.OK,
            await AccountSecuritySteps.LogInStatusAsync(
                _fixture,
                newEmail,
                ApiTestFixture.SeededAccountPassword
            )
        );
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
    public async Task Should_TellThePreviousAddress_When_HerLoginEmailChanged()
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

        await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);

        var notice = await _fixture.Mailbox.SingleMailToAsync(ctx.Identity.EmailOf("anna"), ct);
        Assert.Equal(AccountSecuritySteps.NoticeSubject, notice.Subject);
        Assert.Contains(LoginEmailChangedLead, notice.Text, StringComparison.Ordinal);
        var toNewAddress = await _fixture.Mailbox.MailsToAsync(newEmail, 1, ct);
        Assert.Equal(AccountSecuritySteps.ConfirmationSubject, Assert.Single(toNewAddress).Subject);
    }

    [Fact]
    public async Task Should_MoveHerContactEmailAlong_When_SheKeptTheContactEmailTicked()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var newEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        var code = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            newEmail,
            ct
        );

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var changedAt = _fixture.TimeProvider.GetUtcNow();

                await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);

                await ctx
                    .Expected.Person(annaId)
                    .ToHaveContactDetails(
                        newEmail,
                        "0170 1234567",
                        "Am Anger 3",
                        "99706",
                        "Sondershausen"
                    )
                    .Person(annaId)
                    .ToHaveContactChangedBy(annaId, changedAt)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveHerContactEmail_When_SheUntickedTheContactEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var newEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        var code = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            newEmail,
            ct,
            updateContactEmail: false
        );

        var response = await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.Person(annaId)
            .ToHaveContactDetails(
                "anna@kontakt.test",
                "0170 1234567",
                "Am Anger 3",
                "99706",
                "Sondershausen"
            )
            .Person(annaId)
            .ToHaveNoContactChange()
            .Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToSignInAs(newEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheCode_When_ItDoesNotMatch()
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

        var wrong = await AccountSecuritySteps.ConfirmLoginEmailAsync(
            client,
            InvitationSteps.WrongConfirmationCode(code)
        );

        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        await AccountSecuritySteps.AssertRefusedOnAsync(wrong, CodeField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("anna"))
            .ToSignInAs(ctx.Identity.EmailOf("anna"))
            .AssertAsync(ct);
        var right = await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);
        Assert.Equal(HttpStatusCode.NoContent, right.StatusCode);
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

    [Fact]
    public async Task Should_KeepHerSessionsAlive_When_HerLoginEmailChanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ArrangeAnnaAsync(ct);
        var session = await ctx.Identity.LogInAsync(
            ctx.Identity.EmailOf("anna"),
            ApiTestFixture.SeededAccountPassword,
            ct
        );
        var client = AccountSecuritySteps.ClientWith(_fixture, session.AccessToken);
        var code = await AccountSecuritySteps.RequestLoginEmailCodeAsync(
            _fixture,
            client,
            InvitationSteps.UniqueContactEmail("anna-neu"),
            ct
        );

        await AccountSecuritySteps.ConfirmLoginEmailAsync(client, code);

        Assert.Equal(
            HttpStatusCode.OK,
            (await AccountSecuritySteps.RefreshAsync(_fixture, session.RefreshToken)).StatusCode
        );
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_NoAccessTokenIsSent()
    {
        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<ConfirmMyLoginEmail, ConfirmMyLoginEmailRequest, EmptyResponse>(
                new ConfirmMyLoginEmailRequest { Code = "123456" }
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
