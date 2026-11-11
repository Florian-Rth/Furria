using System.Globalization;
using System.Net;
using Furria.Api.Endpoints.Auth;
using Furria.Api.RateLimiting;
using Furria.Application.Identity;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Auth;

public sealed class PostClaimWindowClaimTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostClaimWindowClaimTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private DateOnly AdultBirthDate => _fixture.Today.AddYears(-34).AddDays(-17);

    [Fact]
    public async Task Should_InviteHerThroughTheWindow_When_ExactlyOnePersonMatches()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddClaimablePerson("anna", "Anna", "Huber", AdultBirthDate, _fixture.Today)
                        .AddClaimablePerson(
                            "anna-sister",
                            "Anna",
                            "Huber",
                            AdultBirthDate.AddYears(-2),
                            _fixture.Today
                        )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        await OpenWindowAsync(ctx, ct);

        var (response, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ClaimOutcome.Invited, result.Outcome);
        Assert.NotNull(result.Token);
        await ctx
            .Expected.LiveInvitationOfPerson(annaId)
            .ToBeIssuedAs(InvitationChannel.ClaimWindow, isReminder: false, issuedByPersonId: null)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Claimed)
            .AccountEventsOfPerson(annaId)
            .ToHaveNoLatestActor()
            .InvitationsOfPerson(ctx.Identity.People.IdOf("anna-sister"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData("  JÜRGEN   peter ", "mueller-lüdenscheid")]
    [InlineData("Juergen-Peter", "Müller Lüdenscheid")]
    public async Task Should_MatchHer_When_TheNameDiffersOnlyInSpelling(
        string firstName,
        string lastName
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "juergen",
                        "Jürgen-Peter",
                        "Müller-Lüdenscheid",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);

        var (response, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            firstName,
            lastName,
            AdultBirthDate
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ClaimOutcome.Invited, result.Outcome);
    }

    [Fact]
    public async Task Should_MatchHer_When_HerNameCarriesAnAccentSheLeavesOut()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "renee",
                        "Renée",
                        "Ćosić",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);

        var (_, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Renee",
            "Cosic",
            AdultBirthDate
        );

        Assert.Equal(ClaimOutcome.Invited, result.Outcome);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_TwoPersonsShareNameAndBirthDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddClaimablePerson("anna", "Anna", "Huber", AdultBirthDate, _fixture.Today)
                        .AddClaimablePerson(
                            "anna-twin",
                            "Anna",
                            "Huber",
                            AdultBirthDate,
                            _fixture.Today
                        )
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);

        var (_, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );

        Assert.Equal(ClaimOutcome.NotFound, result.Outcome);
        Assert.Null(result.Token);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("anna-twin"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_OnlyTheFirstNameOrTheBirthDateMatches()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "anna",
                        "Anna",
                        "Huber",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);
        var client = _fixture.CreateClient();

        var (_, otherLastName) = await ClaimWindowSteps.ClaimAsync(
            client,
            "Anna",
            "Hubert",
            AdultBirthDate
        );
        var (_, otherBirthDate) = await ClaimWindowSteps.ClaimAsync(
            client,
            "Anna",
            "Huber",
            AdultBirthDate.AddDays(1)
        );

        Assert.Equal(ClaimOutcome.NotFound, otherLastName.Outcome);
        Assert.Equal(ClaimOutcome.NotFound, otherBirthDate.Outcome);
    }

    [Fact]
    public async Task Should_ReportHasAccount_When_SheAlreadyHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddClaimablePerson("anna", "Anna", "Huber", AdultBirthDate, _fixture.Today)
                        .AddAccount("anna")
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);

        var (_, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );

        Assert.Equal(ClaimOutcome.HasAccount, result.Outcome);
        Assert.Null(result.Token);
    }

    [Fact]
    public async Task Should_ReportHasEmail_When_HerContactEmailIsOnRecord()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Huber")
                        .AddPersonContact(
                            "anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            birthDate: AdultBirthDate
                        )
                        .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);

        var (_, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );

        Assert.Equal(ClaimOutcome.HasEmail, result.Outcome);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportUnderAge_When_SheIsBelowTheClubsAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var childBirthDate = _fixture.Today.AddYears(-12);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "mia",
                        "Mia",
                        "Huber",
                        childBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);

        var (_, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Mia",
            "Huber",
            childBirthDate
        );

        Assert.Equal(ClaimOutcome.UnderAge, result.Outcome);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("mia"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportNotFound_When_SheIsNotAffiliatedOrArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Huber")
                        .AddPersonContact("anna", birthDate: AdultBirthDate, withoutEmail: true)
                        .AddClaimablePerson(
                            "berta",
                            "Berta",
                            "Huber",
                            AdultBirthDate,
                            _fixture.Today
                        )
                        .AddArchive("berta", _fixture.Today)
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);
        var client = _fixture.CreateClient();

        var (_, unaffiliated) = await ClaimWindowSteps.ClaimAsync(
            client,
            "Anna",
            "Huber",
            AdultBirthDate
        );
        var (_, archived) = await ClaimWindowSteps.ClaimAsync(
            client,
            "Berta",
            "Huber",
            AdultBirthDate
        );

        Assert.Equal(ClaimOutcome.NotFound, unaffiliated.Outcome);
        Assert.Equal(ClaimOutcome.NotFound, archived.Outcome);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .InvitationsOfPerson(ctx.Identity.People.IdOf("berta"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportClosed_When_NoWindowWasEverOpened()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "anna",
                        "Anna",
                        "Huber",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );

        var (response, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ClaimOutcome.Closed, result.Outcome);
        Assert.Null(result.Token);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReportClosed_When_TheWindowHasPassedItsEnd()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "anna",
                        "Anna",
                        "Huber",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);
        ClaimOutcome? outcome = null;

        await _fixture.AtLaterTimeAsync(
            ClaimWindowSteps.OpenFor,
            async () =>
            {
                var (_, result) = await ClaimWindowSteps.ClaimAsync(
                    _fixture.CreateClient(),
                    "Anna",
                    "Huber",
                    AdultBirthDate
                );
                outcome = result.Outcome;
            }
        );

        Assert.Equal(ClaimOutcome.Closed, outcome);
    }

    [Fact]
    public async Task Should_VoidHerPreviousInvitation_When_SheClaims()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "anna",
                        "Anna",
                        "Huber",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var inPerson = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        await ClaimWindowSteps.OpenUntilAsync(
            manager,
            _fixture.TimeProvider.GetUtcNow() + ClaimWindowSteps.OpenFor
        );

        var (_, result) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );
        var (_, earlierLookup) = await InvitationSteps.LookUpAsync(
            _fixture.CreateClient(),
            InvitationSteps.TokenOf(inPerson.Link)
        );

        Assert.Equal(ClaimOutcome.Invited, result.Outcome);
        Assert.Equal(InvitationLookupStatus.Dead, earlierLookup.Status);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCountOn(InvitationChannel.ClaimWindow, 1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Invited, AccountEventKind.Claimed)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SignHerInWithTheLoginEmailSheChose_When_SheRedeemsTheClaimedInvitation()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddClaimablePerson(
                        "anna",
                        "Anna",
                        "Huber",
                        AdultBirthDate,
                        _fixture.Today
                    )
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        await OpenWindowAsync(ctx, ct);
        var chosenEmail = InvitationSteps.UniqueContactEmail("anna-eigene");
        var (_, claim) = await ClaimWindowSteps.ClaimAsync(
            _fixture.CreateClient(),
            "Anna",
            "Huber",
            AdultBirthDate
        );
        var token = claim.Token!;

        var (_, lookup) = await InvitationSteps.LookUpAsync(_fixture.CreateClient(), token);
        var confirmationCode = await InvitationSteps.RequestConfirmationCodeAsync(
            _fixture,
            token,
            chosenEmail,
            ct
        );
        var (response, redemption) = await InvitationSteps.RedeemAsync(
            _fixture.CreateClient(),
            token,
            loginEmail: chosenEmail,
            confirmationCode: confirmationCode
        );

        Assert.Equal(InvitationLookupStatus.Live, lookup.Status);
        Assert.Equal("Anna", lookup.FirstName);
        Assert.Null(lookup.LoginEmail);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        InvitationSteps.SignedInClient(_fixture, redemption);
        await ctx
            .Expected.AccountOfPerson(annaId)
            .ToHaveLoginEmail(chosenEmail)
            .Person(annaId)
            .ToHaveContactDetails(chosenEmail, null, null, null, null)
            .AccountEventsOfPerson(annaId)
            .ToHaveKindsInOrder(AccountEventKind.Claimed, AccountEventKind.Redeemed)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ServeAHallBehindOneAddress_When_ItClaimsBeyondTheGeneralPerIpLimit()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        await using var host = OnboardingRateLimitSteps.VenueHost(_fixture);
        var client = OnboardingRateLimitSteps.VenueClient(host);
        var attempt = 0;

        await OnboardingRateLimitSteps.AssertServesTheHallAsync(async () =>
            (await ClaimWindowSteps.ClaimAsync(client, $"Gast{++attempt}", "Halle", AdultBirthDate))
                .Response
                .StatusCode
        );
    }

    [Fact]
    public async Task Should_CutOffGuessingBirthDates_When_OneNameIsClaimedTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddClaimablePerson("anna", "Anna", "Huber", AdultBirthDate, _fixture.Today)
                        .AddClaimablePerson("ben", "Ben", "Gruber", AdultBirthDate, _fixture.Today)
                ),
            ct
        );
        await OpenWindowAsync(ctx, ct);
        var permits = new SignedOutRateLimitOptions().PermitsPerClaimName;
        await using var host = _fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [
                    $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerClaimName)}"
                ] = permits.ToString(CultureInfo.InvariantCulture),
            }
        );
        var guesses = new List<ClaimOutcome>();

        for (var guess = 1; guess <= permits; guess++)
        {
            var (_, result) = await ClaimWindowSteps.ClaimAsync(
                host.CreateClientForwardedFor($"203.0.113.{guess}"),
                "Anna",
                "Huber",
                AdultBirthDate.AddDays(guess)
            );
            guesses.Add(result.Outcome);
        }
        var (refused, _) = await ClaimWindowSteps.ClaimAsync(
            host.CreateClientForwardedFor("198.51.100.1"),
            "  ANNA ",
            "huber",
            AdultBirthDate
        );
        var (_, other) = await ClaimWindowSteps.ClaimAsync(
            host.CreateClientForwardedFor("198.51.100.1"),
            "Ben",
            "Gruber",
            AdultBirthDate
        );

        Assert.All(guesses, outcome => Assert.Equal(ClaimOutcome.NotFound, outcome));
        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
        Assert.Equal(ClaimOutcome.Invited, other.Outcome);
        await ctx
            .Expected.InvitationsOfPerson(ctx.Identity.People.IdOf("anna"))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    private async Task OpenWindowAsync(SeededContext ctx, CancellationToken ct)
    {
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        await ClaimWindowSteps.OpenUntilAsync(
            manager,
            _fixture.TimeProvider.GetUtcNow() + ClaimWindowSteps.OpenFor
        );
    }
}
