using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class RedeemInvitationTests
{
    private const string ConfirmationCodeField = "confirmationCode";
    private const string LoginEmailField = "loginEmail";
    private const string PasswordField = "password";

    private readonly ApiTestFixture _fixture;

    public RedeemInvitationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SignHerIn_When_SheRedeemsTheMailedLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var signedIn = InvitationSteps.SignedInClient(_fixture, redemption);
        var (meResponse, me) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        Assert.Equal(annaEmail, me.Email);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(annaEmail)
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetHerLogInWithThePassword_When_SheRedeemedTheLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            ctx.Identity.People.IdOf("anna"),
            annaEmail,
            ct
        );

        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        var login = await ctx.Identity.LogInAsync(annaEmail, InvitationSteps.ValidPassword, ct);
        Assert.NotEmpty(login.AccessToken);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInvitationHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        HttpStatusCode status = default;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(14),
            async () =>
                status = (await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token))
                    .Response
                    .StatusCode
        );

        Assert.Equal(HttpStatusCode.Conflict, status);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInvitationWasVoidedByANewerOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(manager, annaId);
        await InvitationSteps.InviteAsync(manager, annaId);
        var mails = await _fixture.Mailbox.MailsToAsync(annaEmail, 2, ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            mails[0].LinkToken()
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInvitationWasAlreadyRedeemed()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            ctx.Identity.People.IdOf("anna"),
            annaEmail,
            ct
        );
        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "Ein-Anderes-Passwort-1!"
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheTokenIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            InvitationSteps.UnknownToken()
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePasswordIsShorterThanTwelveCharacters()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "Kurz-1!"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheInvitationLive_When_IdentityRejectsThePassword()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (rejected, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "nurkleinbuchstaben"
        );
        var (accepted, _) = await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token);

        Assert.Equal(HttpStatusCode.BadRequest, rejected.StatusCode);
        Assert.Equal(HttpStatusCode.OK, accepted.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneTokenIsTriedTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var token = InvitationSteps.UnknownToken();
        var client = _fixture.CreateClient();

        for (var attempt = 0; attempt < ApiTestFixture.PermitsPerInvitationToken; attempt++)
            await InvitationSteps.RedeemAsync(client, token);
        var (response, _) = await InvitationSteps.RedeemAsync(client, token);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
    }

    [Fact]
    public async Task Should_SignHerIn_When_SheTypesTheInPersonCode()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var (response, redemption) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            issued.Code.ToLowerInvariant().Replace('-', ' '),
            loginEmail: annaEmail
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var signedIn = InvitationSteps.SignedInClient(_fixture, redemption);
        var (meResponse, me) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(annaEmail)
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignHerIn_When_SheScansTheInPersonQr()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            InvitationSteps.TokenOf(issued.Link)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.Redeemed, redemption.Outcome);
        await ctx.Expected.AccountOfPerson(annaId).ToHaveLoginEmail(annaEmail).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheInPersonCodeHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson(
                        "anna",
                        "Anna",
                        InvitationSteps.UniqueContactEmail("anna"),
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);

        HttpStatusCode status = default;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(15),
            async () =>
                status = (
                    await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), issued.Code)
                )
                    .Response
                    .StatusCode
        );

        Assert.Equal(HttpStatusCode.Conflict, status);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MailACodeAndWait_When_SheChoosesAnotherLoginEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-privat");

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.ConfirmationRequired, redemption.Outcome);
        Assert.Null(redemption.Session);
        Assert.Equal(
            _fixture.TimeProvider.GetUtcNow().AddMinutes(15),
            redemption.ConfirmationExpiresAt
        );
        var mail = await _fixture.Mailbox.SingleMailToAsync(chosenEmail, ct);
        Assert.Equal("Dein Bestätigungscode", mail.Subject);
        Assert.Contains("Hallo Anna,", mail.Text, StringComparison.Ordinal);
        Assert.Matches("^[0-9]{6}$", mail.ConfirmationCode());
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignHerInWithTheChosenEmail_When_SheConfirmsTheMailedCode()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-privat");
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            token,
            chosenEmail,
            ct
        );

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: code
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.Redeemed, redemption.Outcome);
        await ctx.Expected.AccountOfPerson(annaId).ToHaveLoginEmail(chosenEmail).AssertAsync(ct);
        var login = await ctx.Identity.LogInAsync(chosenEmail, InvitationSteps.ValidPassword, ct);
        Assert.NotEmpty(login.AccessToken);
    }

    [Fact]
    public async Task Should_RefuseTheConfirmationCode_When_ItDoesNotMatch()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-privat");
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            token,
            chosenEmail,
            ct
        );

        var (wrong, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: InvitationSteps.WrongConfirmationCode(code)
        );
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
        var (right, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: code
        );

        Assert.Equal(HttpStatusCode.BadRequest, wrong.StatusCode);
        await AssertRefusedOnAsync(wrong, ConfirmationCodeField, ct);
        Assert.Equal(HttpStatusCode.OK, right.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseTheConfirmationCode_When_ItHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-privat");
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            token,
            chosenEmail,
            ct
        );

        HttpResponseMessage? response = null;
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(15),
            async () =>
                response = (
                    await InvitationSteps.RedeemAsync(
                        _fixture.CreateClient(),
                        token,
                        loginEmail: chosenEmail,
                        confirmationCode: code
                    )
                ).Response
        );

        Assert.NotNull(response);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ConfirmationCodeField, ct);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KillTheConfirmationCode_When_ItWasMistypedFiveTimes()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-privat");
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            token,
            chosenEmail,
            ct
        );

        for (var attempt = 0; attempt < 5; attempt++)
            await InvitationSteps.RedeemAsync(
                _fixture.CreateClient(),
                token,
                loginEmail: chosenEmail,
                confirmationCode: InvitationSteps.WrongConfirmationCode(code)
            );
        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: code
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ConfirmationCodeField, ct);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheFirstConfirmationCode_When_ANewOneWasSent()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-privat");
        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token, loginEmail: chosenEmail);
        await InvitationSteps.RedeemAsync(_fixture.CreateClient(), token, loginEmail: chosenEmail);
        var mails = await _fixture.Mailbox.MailsToAsync(chosenEmail, 2, ct);
        var firstCode = mails[0].ConfirmationCode();
        var secondCode = mails[1].ConfirmationCode();

        var (first, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: firstCode
        );
        var (second, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: secondCode
        );

        Assert.Equal(HttpStatusCode.BadRequest, first.StatusCode);
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        await ctx.Expected.AccountOfPerson(annaId).ToHaveLoginEmail(chosenEmail).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheConfirmationCode_When_SheChangedTheEmailInBetween()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);
        var firstEmail = InvitationSteps.UniqueContactEmail("anna-privat");
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            token,
            firstEmail,
            ct
        );

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: InvitationSteps.UniqueContactEmail("anna-arbeit"),
            confirmationCode: code
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ConfirmationCodeField, ct);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAsTaken_When_TheChosenEmailIsAnotherAccountsLogin()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddPerson("bruno", "Bruno", "Muster")
                        .AddAccount("bruno")
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: ctx.Identity.EmailOf("bruno").ToUpperInvariant()
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LetTheSecondChooseHerOwnEmail_When_TheSharedInboxIsAlreadyTaken()
    {
        var ct = TestContext.Current.CancellationToken;
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("bruno", "Bruno", sharedEmail, _fixture.Today)
                        .AddEligiblePerson("anna", "Anna", sharedEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var bruno = await InvitationSteps.InviteInPersonAsync(
            manager,
            ctx.Identity.People.IdOf("bruno")
        );
        await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), bruno.Code);
        var anna = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        var annaToken = InvitationSteps.TokenOf(anna.Link);
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");

        var (taken, _) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            anna.Code,
            loginEmail: sharedEmail
        );
        var code = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            annaToken,
            annaEmail,
            ct
        );
        var (confirmed, _) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            anna.Code,
            loginEmail: annaEmail,
            confirmationCode: code
        );

        Assert.Equal(HttpStatusCode.Conflict, taken.StatusCode);
        await AssertRefusedOnAsync(taken, LoginEmailField, ct);
        Assert.Equal(HttpStatusCode.OK, confirmed.StatusCode);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(annaEmail)
            .AccountOfPerson(ctx.Identity.People.IdOf("bruno"))
            .ToHaveLoginEmail(sharedEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseThePasswordBeforeMailingACode_When_IdentityWouldRejectIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "nurkleinbuchstaben",
            loginEmail: InvitationSteps.UniqueContactEmail("anna-privat")
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, PasswordField, ct);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_BothTheTokenAndTheCodeAreGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
                new RedeemInvitationRequest
                {
                    Token = InvitationSteps.UnknownToken(),
                    Code = InvitationSteps.UnknownCode(),
                    Password = InvitationSteps.ValidPassword,
                }
            );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_SetTheNewPasswordEndHerSessionsAndSignHerIn_When_SheRedeemsARecovery()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(ct);
        var loginEmail = ctx.Identity.EmailOf("anna");
        var accountId = ctx.Identity.Accounts.IdOf("anna");
        var earlier = await ctx.Identity.LogInAsync(
            loginEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );

        var (response, redemption) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var signedIn = InvitationSteps.SignedInClient(_fixture, redemption);
        var (meResponse, me) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        var (refreshResponse, _) = await _fixture
            .CreateClient()
            .POSTAsync<Refresh, RefreshRequest, RefreshResponse>(
                new RefreshRequest { RefreshToken = earlier.RefreshToken }
            );
        Assert.Equal(HttpStatusCode.Unauthorized, refreshResponse.StatusCode);
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            await LogInStatusAsync(loginEmail, ApiTestFixture.SeededAccountPassword)
        );
        Assert.Equal(
            HttpStatusCode.OK,
            await LogInStatusAsync(loginEmail, InvitationSteps.ValidPassword)
        );
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(loginEmail)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Recovered)
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .RefreshTokensOf(accountId)
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TellHerLoginEmail_When_HerAccessIsRecovered()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, _, code) = await ArrangeRecoveryAsync(ct);

        await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), code);

        var notice = await _fixture.Mailbox.SingleMailToAsync(ctx.Identity.EmailOf("anna"), ct);
        Assert.Equal("Dein Zugang zur Vereins-App wurde geändert", notice.Subject);
        Assert.Contains(
            "vor Ort im Verein wiederhergestellt",
            notice.Text,
            StringComparison.Ordinal
        );
    }

    [Fact]
    public async Task Should_ConfirmTheNewLoginEmailByCodeAndTellThePreviousOne_When_ARecoveryChangesIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(ct);
        var previousEmail = ctx.Identity.EmailOf("anna");
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        var (firstResponse, first) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail
        );
        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.ConfirmationRequired, first.Outcome);
        var confirmationCode = (
            await _fixture.Mailbox.SingleMailToAsync(chosenEmail, ct)
        ).ConfirmationCode();

        var (response, redemption) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail,
            confirmationCode: confirmationCode
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.Redeemed, redemption.Outcome);
        Assert.Equal(
            HttpStatusCode.OK,
            await LogInStatusAsync(chosenEmail, InvitationSteps.ValidPassword)
        );
        var notice = await _fixture.Mailbox.SingleMailToAsync(previousEmail, ct);
        Assert.Contains(
            "vor Ort im Verein wiederhergestellt",
            notice.Text,
            StringComparison.Ordinal
        );
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(chosenEmail)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(
                AccountEventKind.Invited,
                AccountEventKind.Recovered,
                AccountEventKind.LoginEmailChanged
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepHerLogin_When_ARecoveryIsConfirmedWithAWrongCode()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(ct);
        var previousEmail = ctx.Identity.EmailOf("anna");
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail
        );
        var confirmationCode = (
            await _fixture.Mailbox.SingleMailToAsync(chosenEmail, ct)
        ).ConfirmationCode();

        var (response, _) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail,
            confirmationCode: InvitationSteps.WrongConfirmationCode(confirmationCode)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ConfirmationCodeField, ct);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(previousEmail)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAsTaken_When_ARecoveryChoosesAnotherAccountsLogin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddAccount("anna")
                        .AddAccount("bea")
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.IssueRecoveryAsync(manager, annaId);

        var (response, _) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            issued.Code,
            loginEmail: ctx.Identity.EmailOf("bea")
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(ctx.Identity.EmailOf("anna"))
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheRecovery_When_HerAccountWasDisabledMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(ct);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.SetAccountDisabledAsync(manager, annaId, isDisabled: true);

        var (response, _) = await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), code);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Disabled)
            .AssertAsync(ct);
    }

    private async Task<(SeededContext Ctx, int AnnaId, string Code)> ArrangeRecoveryAsync(
        CancellationToken ct
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("anna", "Anna", "Muster").AddAccount("anna")
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var issued = await InvitationSteps.IssueRecoveryAsync(manager, annaId);

        return (ctx, annaId, issued.Code);
    }

    private async Task<HttpStatusCode> LogInStatusAsync(string email, string password)
    {
        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<Login, LoginRequest, LoginResponse>(
                new LoginRequest { Email = email, Password = password }
            );

        return response.StatusCode;
    }

    private async Task<(SeededContext Ctx, int AnnaId, string Token)> ArrangeMailInvitationAsync(
        CancellationToken ct
    )
    {
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        return (ctx, annaId, token);
    }

    private static async Task AssertRefusedOnAsync(
        HttpResponseMessage response,
        string field,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.NotNull(payload);
        Assert.Contains(field, payload.Errors.Keys);
    }
}
