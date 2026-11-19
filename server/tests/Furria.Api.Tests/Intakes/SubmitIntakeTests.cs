using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Intakes;
using Furria.Api.Tests.Auth;
using Furria.Core.Identity;
using Furria.Core.Push;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;
using static Furria.Api.Tests.Intakes.IntakeSubmissions;
using static Furria.Api.Tests.Push.SubscribedDevices;

namespace Furria.Api.Tests.Intakes;

public sealed class SubmitIntakeTests : IClassFixture<ApiTestFixture>
{
    private const string UnknownToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private const string Existing = "existing";
    private const string NewPassword = "Neues-Passwort-2026!";

    private readonly ApiTestFixture _fixture;

    public SubmitIntakeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_EnterHerWithMembershipAndGroups_When_NobodyInTheRegisterMatches()
    {
        var ct = TestContext.Current.CancellationToken;
        var memberFrom = _fixture.Today.AddDays(-3);
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake("fresh", Manager, memberFrom, groupAliases: [Guard, Show])
            ),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var (response, _) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh")));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx
            .Expected.Intake(intakeId)
            .ToBeCompletedAs(personId)
            .Person(personId)
            .ToHaveName("Lena", "Neu")
            .Person(personId)
            .ToHaveBirthDate(AdultBirthDate)
            .Person(personId)
            .ToHaveContactDetails(
                "lena.neu@example.org",
                "0170 1234567",
                "Hauptstraße 1",
                "12345",
                "Narrenstadt"
            )
            .Person(personId)
            .ToHaveContactVisible(true)
            .Person(personId)
            .ToHaveContactChangedBy(personId, _fixture.TimeProvider.GetUtcNow())
            .MembershipsOfPerson(personId)
            .ToHaveOnlyOneFromIntake(intakeId, memberFrom)
            .Person(personId)
            .ToBeInGroupsSince(
                _fixture.Today,
                ctx.Groups.Groups.IdOf(Guard),
                ctx.Groups.Groups.IdOf(Show)
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_InviteHerOnTheStartersBehalfAndHandHerTheLink_When_SheIsOfAgeAndGaveAnEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        var email = InvitationSteps.UniqueContactEmail("lena");

        var (_, submitted) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email));

        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx
            .Expected.LiveInvitationOfPerson(personId)
            .ToBeIssuedAs(
                InvitationChannel.Mail,
                isReminder: false,
                ctx.Identity.People.IdOf(Manager)
            )
            .AssertAsync(ct);
        var mail = await _fixture.Mailbox.SingleMailToAsync(email, ct);
        Assert.EndsWith(mail.LinkToken(), submitted.InvitationLink);
    }

    [Fact]
    public async Task Should_InviteHerOnTheTrainersBehalf_When_AGroupAdminStartedTheIntake()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard])),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var (_, submitted) = await SubmitAsync(
            Adult(ctx.Intakes.LinkTokens.IdOf("fresh")) with
            {
                Street = null,
                Zip = null,
                City = null,
            }
        );

        Assert.NotNull(submitted.InvitationLink);
        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx
            .Expected.LiveInvitationOfPerson(personId)
            .ToBeIssuedAs(
                InvitationChannel.Mail,
                isReminder: false,
                ctx.Identity.People.IdOf(GuardTrainer)
            )
            .MembershipsOfPerson(personId)
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_InviteNobody_When_SheIsBelowTheClubsAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard]))(
                    builder
                );
                builder.Club(club => club.SetClubRecord(ageOfConsent: 18));
            },
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var (response, submitted) = await SubmitAsync(
            Adult(ctx.Intakes.LinkTokens.IdOf("fresh")) with
            {
                BirthDate = _fixture.Today.AddYears(-17),
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(submitted.InvitationLink);
        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx.Expected.InvitationsOfPerson(personId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_InviteNobody_When_SheGaveNoEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var (response, submitted) = await SubmitAsync(
            Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email: null)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(submitted.InvitationLink);
        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx.Expected.InvitationsOfPerson(personId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WaitForReviewWithoutTellingHer_When_SomeoneInTheRegisterHasHerEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today))(builder);
                builder.Identity(identity =>
                    identity
                        .AddPerson(Existing, "Magdalena", "Altmann")
                        .AddPersonContact(Existing, email: "Lena.Neu@Example.org ")
                );
            },
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var (response, submitted) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh")));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Null(submitted.InvitationLink);
        await ctx
            .Expected.Intake(intakeId)
            .ToAwaitReviewHolding("Lena", "Neu", "lena.neu@example.org")
            .MembershipsOfPerson(ctx.Identity.People.IdOf(Existing))
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WaitForReview_When_SomeoneInTheRegisterSharesHerNameAndBirthDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard]))(
                    builder
                );
                builder.Identity(identity =>
                    identity
                        .AddPerson(Existing, "Jörg", "Mößner")
                        .AddPersonContact(Existing, birthDate: AdultBirthDate, withoutEmail: true)
                );
            },
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        await SubmitAsync(
            Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email: null) with
            {
                FirstName = " joerg",
                LastName = "MOESSNER ",
            }
        );

        await ctx
            .Expected.Intake(intakeId)
            .ToAwaitReviewHolding("joerg", "MOESSNER", null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_TellTheStarter_When_HerIntakeIsCompleted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard])),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        var device = await SubscribedDeviceAsync(ctx, GuardTrainer, "trainer-phone", ct);

        await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email: null));

        await _fixture.PushesDrainedAsync(ct);
        var push = Assert.Single(PushesAt(_fixture, device));
        Assert.Equal($"/manage/intakes/{intakeId}", UrlOf(push));
        Assert.Equal("Neuzugang eingetragen", push.GetProperty("title").GetString());
        Assert.Equal("Lena Neu", push.GetProperty("body").GetString());
    }

    [Fact]
    public async Task Should_TellTheStarterToReview_When_TheIntakeWaitsForReview()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today))(builder);
                builder.Identity(identity =>
                    identity
                        .AddPerson(Existing, "Lena", "Alt")
                        .AddPersonContact(Existing, email: "lena.neu@example.org")
                );
            },
            ct
        );
        var device = await SubscribedDeviceAsync(ctx, Manager, "manager-phone", ct);

        await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh")));

        await _fixture.PushesDrainedAsync(ct);
        var push = Assert.Single(PushesAt(_fixture, device));
        Assert.Equal("Neuzugang prüfen", push.GetProperty("title").GetString());
    }

    [Fact]
    public async Task Should_TellNobody_When_TheStarterMutedIntakes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard])),
            ct
        );
        var device = await SubscribedDeviceAsync(ctx, GuardTrainer, "trainer-phone", ct);
        await MutedAsync(ctx, GuardTrainer, PushTopic.Intakes, ct);

        await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email: null));

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, device));
    }

    [Fact]
    public async Task Should_TellNobody_When_TheStarterNoLongerRunsIntakes()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Member, groupAliases: [Guard])),
            ct
        );
        var device = await SubscribedDeviceAsync(ctx, Member, "member-phone", ct);

        await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email: null));

        await _fixture.PushesDrainedAsync(ct);
        Assert.Empty(PushesAt(_fixture, device));
    }

    [Fact]
    public async Task Should_StillEnterHer_When_TheStarterHasSinceBeenErased()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", groupAliases: [Guard])),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        var (response, submitted) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh")));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(submitted.InvitationLink);
        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx
            .Expected.LiveInvitationOfPerson(personId)
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: false, issuedByPersonId: null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RequireHerAddress_When_SheBecomesAMember()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );

        var (response, _) = await SubmitAsync(
            Adult(ctx.Intakes.LinkTokens.IdOf("fresh")) with
            {
                City = null,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Intake(ctx.Intakes.Intakes.IdOf("fresh")).ToStayOpen().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_JoinOnlyTheGroupsStillRunning_When_AGroupWasArchivedMeanwhile()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake("fresh", Manager, _fixture.Today, groupAliases: [Guard, Retired])
            ),
            ct
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");

        await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh")));

        var personId = await MadePersonIdAsync(_fixture, intakeId, ct);
        await ctx
            .Expected.Person(personId)
            .ToBeInGroupsSince(_fixture.Today, ctx.Groups.Groups.IdOf(Guard))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseHer_When_NoAffiliationIsLeftAfterHerGroupWasArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, groupAliases: [Retired])),
            ct
        );

        var (response, _) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh")));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx.Expected.Intake(ctx.Intakes.Intakes.IdOf("fresh")).ToStayOpen().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseASecondSubmission_When_TheLinkWasAlreadyUsed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var token = ctx.Intakes.LinkTokens.IdOf("fresh");
        await SubmitAsync(Adult(token));

        var (response, _) = await SubmitAsync(Adult(token) with { FirstName = "Zweite" });

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseHer_When_TheLinkHasExpired()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "expired",
                    Manager,
                    _fixture.Today,
                    expiresAt: _fixture.TimeProvider.GetUtcNow().AddSeconds(-1)
                )
            ),
            ct
        );

        var (response, _) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("expired")));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseHer_When_TheLinkIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(With(), ct);

        var (response, _) = await SubmitAsync(Adult(UnknownToken));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AskHerToConfirmTheEmail_When_SheRedeemsTheHandedOverLink()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", Manager, _fixture.Today)),
            ct
        );
        var email = InvitationSteps.UniqueContactEmail("lena");
        var (_, submitted) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("fresh"), email));

        var (response, redeemed) = await _fixture
            .CreateClient()
            .POSTAsync<RedeemInvitation, RedeemInvitationRequest, RedeemInvitationResponse>(
                new() { Token = TokenOf(submitted.InvitationLink), Password = NewPassword }
            );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(RedeemInvitationOutcome.ConfirmationRequired, redeemed.Outcome);
        Assert.Null(redeemed.Session);
    }

    [Fact]
    public async Task Should_RefuseHer_When_TheIntakeWasDiscarded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes =>
                intakes.AddIntake(
                    "discarded",
                    Manager,
                    _fixture.Today,
                    discardedAt: _fixture.TimeProvider.GetUtcNow()
                )
            ),
            ct
        );

        var (response, _) = await SubmitAsync(Adult(ctx.Intakes.LinkTokens.IdOf("discarded")));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task Should_RefuseHer_When_HerBirthDateLiesInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            With(intakes => intakes.AddIntake("fresh", GuardTrainer, groupAliases: [Guard])),
            ct
        );

        var (response, _) = await SubmitAsync(
            Adult(ctx.Intakes.LinkTokens.IdOf("fresh")) with
            {
                BirthDate = _fixture.Today.AddDays(1),
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Intake(ctx.Intakes.Intakes.IdOf("fresh")).ToStayOpen().AssertAsync(ct);
    }

    private static string TokenOf(string? invitationLink) =>
        invitationLink?[(invitationLink.IndexOf('=') + 1)..] ?? "";

    private Task<TestResult<SubmitIntakeResponse>> SubmitAsync(SubmitIntakeRequest request) =>
        _fixture
            .CreateClient()
            .POSTAsync<SubmitIntake, SubmitIntakeRequest, SubmitIntakeResponse>(request);
}
