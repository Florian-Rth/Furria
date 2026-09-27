using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

[Collection("Api")]
public sealed class RedeemInvitationTests
{
    private const string ConfirmationCodeField = "confirmationCode";
    private const string LoginEmailField = "loginEmail";
    private const string PasswordField = "password";
    private const string ClaimPasswordField = "claimPassword";
    private const string ClaimPasskeyField = "claimPasskey";

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
    public async Task Should_RefuseThePasswordAndKeepTheInvitationLive_When_ItHasSevenCharacters()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "kurzpw1"
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, PasswordField, ct);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignHerIn_When_ThePasswordIsEightLowercaseLetters()
    {
        var ct = TestContext.Current.CancellationToken;
        var (_, annaId, token) = await ArrangeMailInvitationAsync(ct);

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "tanzbein"
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var (_, me) = await InvitationSteps
            .SignedInClient(_fixture, redemption)
            .GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(annaId, me.Person.Id);
        Assert.Equal(HttpStatusCode.OK, await LogInStatusAsync(me.Email, "tanzbein"));
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
    public async Task Should_RefuseAsTaken_When_TheChosenEmailIsTheLoginOfAnAffiliatedAccount()
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
                        .AddMembership("bruno-membership", "bruno", _fixture.Today.AddYears(-1))
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
    public async Task Should_RefuseThePasswordBeforeMailingACode_When_ItIsTooShort()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeMailInvitationAsync(ct);

        var (response, _) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            "kurzpw1",
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
            .ToHaveKindsInOrder(AccountEventKind.RecoveryIssued, AccountEventKind.Recovered)
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
                AccountEventKind.RecoveryIssued,
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
    public async Task Should_LetHerContactEmailFollow_When_ARecoveryChangesHerLoginEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(
            ct,
            InvitationSteps.UniqueContactEmail("anna-kontakt")
        );
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail
        );
        var confirmationCode = (
            await _fixture.Mailbox.SingleMailToAsync(chosenEmail, ct)
        ).ConfirmationCode();

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(1),
            async () =>
            {
                var changedAt = _fixture.TimeProvider.GetUtcNow();

                var (response, _) = await InvitationSteps.RedeemByCodeAsync(
                    _fixture.CreateClient(),
                    code,
                    loginEmail: chosenEmail,
                    confirmationCode: confirmationCode
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await ctx
                    .Expected.Person(annaId)
                    .ToHaveContactDetails(chosenEmail, null, null, null, null)
                    .Person(annaId)
                    .ToHaveContactChangedBy(annaId, changedAt)
                    .AccountOfPerson(annaId)
                    .ToHaveLoginEmail(chosenEmail)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_KeepHerContactEmail_When_SheOptsOutWhileARecoveryChangesHerLoginEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var contactEmail = InvitationSteps.UniqueContactEmail("anna-kontakt");
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(ct, contactEmail);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-neu");
        await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail,
            updateContactEmail: false
        );
        var confirmationCode = (
            await _fixture.Mailbox.SingleMailToAsync(chosenEmail, ct)
        ).ConfirmationCode();

        var (response, _) = await InvitationSteps.RedeemByCodeAsync(
            _fixture.CreateClient(),
            code,
            loginEmail: chosenEmail,
            confirmationCode: confirmationCode
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Person(annaId)
            .ToHaveContactDetails(contactEmail, null, null, null, null)
            .Person(annaId)
            .ToHaveNoContactChange()
            .AccountOfPerson(annaId)
            .ToHaveLoginEmail(chosenEmail)
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
            .ToHaveKindsInOrder(AccountEventKind.RecoveryIssued, AccountEventKind.Disabled)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AskHerToSignIn_When_TheChosenEmailIsTheLoginOfAnAccountOutsideTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        var strayId = ctx.Identity.People.IdOf("stray");

        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: ctx.Identity.EmailOf("stray")
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.ClaimRequired, redemption.Outcome);
        Assert.Null(redemption.Session);
        Assert.Null(redemption.ConfirmationExpiresAt);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(strayId)
            .AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MoveTheAccountOntoHer_When_SheSignsInWithTheClaimedAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        var strayId = ctx.Identity.People.IdOf("stray");
        var strayEmail = ctx.Identity.EmailOf("stray");

        var (response, redemption) = await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            strayEmail,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var signedIn = InvitationSteps.SignedInClient(_fixture, redemption);
        var (meResponse, me) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        Assert.Equal(strayEmail, me.Email);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(annaId)
            .Person(strayId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(0)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Redeemed)
            .AccountEventsOfPerson(annaId)
            .ToHaveLatestActor(annaId)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignTheClaimedAccountInAsHer_When_ItLogsInWithItsOldPassword()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        var strayEmail = ctx.Identity.EmailOf("stray");
        await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            strayEmail,
            ApiTestFixture.SeededAccountPassword,
            InvitationSteps.ValidPassword
        );

        var login = await ctx.Identity.LogInAsync(
            strayEmail,
            ApiTestFixture.SeededAccountPassword,
            ct
        );

        var client = _fixture.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
            "Bearer",
            login.AccessToken
        );
        var (meResponse, me) = await client.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        Assert.Equal("Anna", me.Person.FirstName);
    }

    [Fact]
    public async Task Should_EndTheClaimedAccountsEarlierSessions_When_SheClaimsIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, _, token) = await ArrangeClaimAsync(ct);
        var strayAccountId = ctx.Identity.Accounts.IdOf("stray");
        await ctx.Identity.ClientForAsync("stray", ct);

        await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            ctx.Identity.EmailOf("stray"),
            ApiTestFixture.SeededAccountPassword
        );

        await ctx
            .Expected.RefreshTokensOf(strayAccountId)
            .ToHaveRevocationCount(RefreshTokenRevocationReason.AllSessionsEnded, 1)
            .RefreshTokensOf(strayAccountId)
            .ToHaveActiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RepointTheContactChangesTheStrayPersonMade_When_SheClaims()
    {
        var ct = TestContext.Current.CancellationToken;
        var changedAt = _fixture.TimeProvider.GetUtcNow().AddDays(-3);
        var (ctx, annaId, token) = await ArrangeClaimAsync(
            ct,
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("carla", "Carla", "Muster")
                        .AddContactChange("carla", "stray", changedAt)
                        .AddContactChange("stray", "stray", changedAt)
                )
        );

        await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            ctx.Identity.EmailOf("stray"),
            ApiTestFixture.SeededAccountPassword
        );

        await ctx
            .Expected.Person(ctx.Identity.People.IdOf("carla"))
            .ToHaveContactChangedBy(annaId, changedAt)
            .Person(annaId)
            .ToHaveNoContactChange()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_MoveTheAccountOntoHer_When_SheConfirmsTheClaimWithItsPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        var strayId = ctx.Identity.People.IdOf("stray");
        var strayEmail = ctx.Identity.EmailOf("stray");
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(
            await ctx.Identity.ClientForAsync("stray", ct),
            authenticator
        );

        var (response, redemption) = await ClaimSteps.ClaimByPasskeyAsync(
            _fixture.CreateClient(),
            token,
            strayEmail,
            await PasskeySteps.AssertAsync(_fixture, authenticator)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var signedIn = InvitationSteps.SignedInClient(_fixture, redemption);
        var (meResponse, me) = await signedIn.GETAsync<GetMe, GetMeResponse>();
        Assert.Equal(HttpStatusCode.OK, meResponse.StatusCode);
        Assert.Equal(annaId, me.Person.Id);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(annaId)
            .Person(strayId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .PasskeyChallenges()
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveBothPersonsAndTheAccountUntouched_When_TheClaimPasskeyIsAnotherAccounts()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(
            ct,
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("berta", "Berta", "Beispiel").AddAccount("berta")
                )
        );
        var strayId = ctx.Identity.People.IdOf("stray");
        using var bertasAuthenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(
            await ctx.Identity.ClientForAsync("berta", ct),
            bertasAuthenticator
        );

        var (response, _) = await ClaimSteps.ClaimByPasskeyAsync(
            _fixture.CreateClient(),
            token,
            ctx.Identity.EmailOf("stray"),
            await PasskeySteps.AssertAsync(_fixture, bertasAuthenticator)
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ClaimPasskeyField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(strayId)
            .Account(ctx.Identity.Accounts.IdOf("berta"))
            .ToBeLinkedTo(ctx.Identity.People.IdOf("berta"))
            .Person(strayId)
            .ToExist()
            .Person(annaId)
            .ToExist()
            .AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheClaim_When_ItCarriesBothThePasswordAndAPasskey()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        using var authenticator = new SoftwareAuthenticator();
        await PasskeySteps.RegisterAsync(
            await ctx.Identity.ClientForAsync("stray", ct),
            authenticator
        );
        var attempt = await PasskeySteps.AssertAsync(_fixture, authenticator);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
                new RedeemInvitationRequest
                {
                    Token = token,
                    LoginEmail = ctx.Identity.EmailOf("stray"),
                    ClaimPassword = ApiTestFixture.SeededAccountPassword,
                    ClaimPasskey = new RedeemInvitationPasskeyDto
                    {
                        ChallengeId = attempt.ChallengeId,
                        Credential = attempt.Credential,
                    },
                }
            );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ClaimPasskeyField, ct);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveBothPersonsAndTheAccountUntouched_When_TheClaimPasswordIsWrong()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        var strayId = ctx.Identity.People.IdOf("stray");

        var (response, _) = await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            ctx.Identity.EmailOf("stray"),
            ClaimSteps.WrongClaimPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ClaimPasswordField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(strayId)
            .Person(strayId)
            .ToExist()
            .Person(annaId)
            .ToExist()
            .AccountOfPerson(annaId)
            .ToNotExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LockTheClaimedAccountOut_When_TheClaimPasswordIsWrongFiveTimes()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(ct);
        var strayEmail = ctx.Identity.EmailOf("stray");

        for (var attempt = 0; attempt < 5; attempt++)
            await ClaimSteps.ClaimAsync(
                _fixture.CreateClient(),
                token,
                strayEmail,
                ClaimSteps.WrongClaimPassword
            );
        var (response, _) = await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            strayEmail,
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await AssertRefusedOnAsync(response, ClaimPasswordField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(ctx.Identity.People.IdOf("stray"))
            .AccountOfPerson(annaId)
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseAsTaken_When_TheAccountOutsideTheClubIsDisabled()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddPerson("gesperrt", "Gesa", "Muster")
                        .AddAccount("gesperrt", disabled: true)
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

        var (response, _) = await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            ctx.Identity.EmailOf("gesperrt"),
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx.Expected.AccountOfPerson(annaId).ToNotExist().AssertAsync(ct);
    }

    [Theory]
    [InlineData(StrayHolding.EndedMembership)]
    [InlineData(StrayHolding.FeeReduction)]
    [InlineData(StrayHolding.EndedGroupMembership)]
    [InlineData(StrayHolding.GroupAdminship)]
    [InlineData(StrayHolding.EndedRoleHolding)]
    [InlineData(StrayHolding.BoardSeat)]
    [InlineData(StrayHolding.KeyHolding)]
    [InlineData(StrayHolding.AttendanceResponse)]
    [InlineData(StrayHolding.Announcement)]
    public async Task Should_RefuseAsTaken_When_TheStrayPersonHoldsClubData(StrayHolding holding)
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(
            ct,
            builder => Hold(builder, holding, _fixture.Today, _fixture.CurrentSessionYear)
        );
        var strayId = ctx.Identity.People.IdOf("stray");

        var (response, _) = await ClaimSteps.ClaimAsync(
            _fixture.CreateClient(),
            token,
            ctx.Identity.EmailOf("stray"),
            ApiTestFixture.SeededAccountPassword
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await AssertRefusedOnAsync(response, LoginEmailField, ct);
        await ctx
            .Expected.Account(ctx.Identity.Accounts.IdOf("stray"))
            .ToBeLinkedTo(strayId)
            .Person(strayId)
            .ToExist()
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    public enum StrayHolding
    {
        EndedMembership,
        FeeReduction,
        EndedGroupMembership,
        GroupAdminship,
        EndedRoleHolding,
        BoardSeat,
        KeyHolding,
        AttendanceResponse,
        Announcement,
    }

    private static void Hold(
        SeedContextBuilder builder,
        StrayHolding holding,
        DateOnly today,
        int sessionYear
    )
    {
        var longAgo = today.AddYears(-3);
        var lastYear = today.AddYears(-1);
        switch (holding)
        {
            case StrayHolding.EndedMembership:
                builder.Identity(identity =>
                    identity.AddMembership("stray-membership", "stray", longAgo, lastYear)
                );
                break;
            case StrayHolding.FeeReduction:
                builder.Identity(identity =>
                    identity.AddFeeReduction(
                        "stray-reduction",
                        "stray",
                        FeeReductionBasis.Minor,
                        sessionYear - 3,
                        sessionYear - 2
                    )
                );
                break;
            case StrayHolding.EndedGroupMembership:
                builder.Groups(groups =>
                    groups
                        .AddGroup("garde", "Tanzgarde")
                        .AddGroupMembership("stray-garde", "garde", "stray", longAgo, lastYear)
                );
                break;
            case StrayHolding.GroupAdminship:
                builder.Groups(groups =>
                    groups
                        .AddGroup("garde", "Tanzgarde")
                        .AddGroupAdmin("stray-admin", "garde", "stray")
                );
                break;
            case StrayHolding.EndedRoleHolding:
                builder.Roles(roles =>
                    roles
                        .AddRole("kasse", "Kasse")
                        .AddRoleHolding("stray-kasse", "kasse", "stray", longAgo, lastYear)
                );
                break;
            case StrayHolding.BoardSeat:
                builder.Club(club =>
                    club.AddBoardOffice("praesidium", "Präsident")
                        .AddBoardSeat("stray-seat", "praesidium", "stray", longAgo, lastYear)
                );
                break;
            case StrayHolding.KeyHolding:
                builder.Club(club =>
                    club.AddVenue("halle", "Sporthalle")
                        .AddKeyHolding("stray-key", "halle", "stray", longAgo, lastYear)
                );
                break;
            case StrayHolding.AttendanceResponse:
                builder.Club(club =>
                    club.AddCalendarEntry(
                            "sitzung",
                            "Sitzung",
                            new DateTimeOffset(longAgo, TimeOnly.MinValue, TimeSpan.Zero)
                        )
                        .AddAttendanceResponse(
                            "stray-answer",
                            "sitzung",
                            "stray",
                            AttendanceAnswer.Yes
                        )
                );
                break;
            case StrayHolding.Announcement:
                builder.Club(club =>
                    club.AddAnnouncement("stray-news", "stray", "Neuigkeit", "Text")
                );
                break;
            default:
                throw new ArgumentOutOfRangeException(nameof(holding), holding, null);
        }
    }

    private async Task<(SeededContext Ctx, int AnnaId, string Token)> ArrangeClaimAsync(
        CancellationToken ct,
        Action<SeedContextBuilder>? alsoSeed = null
    )
    {
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("anna", "Anna", annaEmail, _fixture.Today)
                        .AddStrayWithAccount("stray", "Anna")
                );
                alsoSeed?.Invoke(builder);
            },
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

    private async Task<(SeededContext Ctx, int AnnaId, string Code)> ArrangeRecoveryAsync(
        CancellationToken ct,
        string? contactEmail = null
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", contactEmail)
                        .AddAccount("anna")
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
