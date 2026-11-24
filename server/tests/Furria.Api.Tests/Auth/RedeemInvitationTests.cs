using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Application.Identity;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Core.Text;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Furria.Tests.Common.WebAuthn;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class RedeemInvitationTests : IClassFixture<ApiTestFixture>
{
    private const string ConfirmationCodeField = "confirmationCode";
    private const string LoginEmailField = "loginEmail";
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        Assert.Equal(annaId, me.Person?.Id);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        Assert.Equal(annaId, me.Person?.Id);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(annaEmail)
            .InvitationsOfPerson(annaId)
            .ToHaveRedeemedCount(1)
            .AssertAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        Assert.Equal(annaId, me.Person?.Id);
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
    public async Task Should_RefuseTheRecovery_When_HerAccountWasDisabledMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, code) = await ArrangeRecoveryAsync(ct);
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.SetAccountDisabledAsync(manager, annaId, isDisabled: true);

        var (response, _) = await InvitationSteps.RedeemByCodeAsync(_fixture.CreateClient(), code);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.RecoveryIssued, AccountEventKind.Disabled)
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
        Assert.Equal(annaId, me.Person?.Id);
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

    [Theory]
    [InlineData(StrayHolding.EndedMembership)]
    [InlineData(StrayHolding.KeyHolding)]
    [InlineData(StrayHolding.Mention)]
    public async Task Should_RefuseAsTaken_When_TheStrayPersonHoldsClubData(StrayHolding holding)
    {
        var ct = TestContext.Current.CancellationToken;
        var (ctx, annaId, token) = await ArrangeClaimAsync(
            ct,
            builder => Hold(builder, holding, _fixture.Today)
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
        KeyHolding,
        Mention,
    }

    private static void Hold(SeedContextBuilder builder, StrayHolding holding, DateOnly today)
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
            case StrayHolding.KeyHolding:
                builder.Club(club =>
                    club.AddVenue("halle", "Sporthalle")
                        .AddKeyHolding("stray-key", "halle", "stray", longAgo, lastYear)
                );
                break;
            case StrayHolding.Mention:
                builder.News(news =>
                    news.AddNewsPost(
                        "stray-mention",
                        "Dank",
                        text: "Dank an @[Sie](person:{stray})"
                    )
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var token = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        return (ctx, annaId, token);
    }

    private async Task<(
        SeededContext Ctx,
        int AnnaId,
        string Code
    )> ArrangeInPersonInvitationWithoutEmailAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            birthDate: _fixture.Today.AddYears(-70),
                            withoutEmail: true
                        )
                        .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);

        return (ctx, annaId, issued.Code);
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
