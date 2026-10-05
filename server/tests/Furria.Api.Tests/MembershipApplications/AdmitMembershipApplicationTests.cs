using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Application.MembershipApplications;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

[Collection("Api")]
public sealed class AdmitMembershipApplicationTests
{
    private const int UnknownApplicationId = 999_999;

    private readonly ApiTestFixture _fixture;

    public AdmitMembershipApplicationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecordHerAsANewMember_When_SheIsAdmittedAsANewPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication("mia", birthDate, email: email)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");

        var (response, admission) = await AdmitAsync(
            admin,
            applicationId,
            personId: null,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Person(admission.PersonId)
            .ToHaveName("Mia", "Schwarzwälder")
            .Person(admission.PersonId)
            .ToHaveBirthDate(birthDate)
            .Person(admission.PersonId)
            .ToHaveContactDetails(email, "0221 987654", "Rosenweg 12a", "50667", "Köln")
            .Membership(admission.MembershipId)
            .ToHavePeriod(_fixture.Today, null)
            .MembershipApplication(applicationId)
            .ToNotExist()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordWhoAdmittedHerAndWhen_When_SheIsAdmitted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (_, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            _fixture.Today
        );

        await ctx
            .Expected.Membership(admission.MembershipId)
            .ToRecordAdmission(
                ctx.Identity.BootstrapAdmin.PersonId,
                _fixture.TimeProvider.GetUtcNow(),
                guardianConsentConfirmed: false
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_InviteHerInTheSameAct_When_SheIsEligibleOnTheAdmissionDay()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        _fixture.Today.AddYears(-30),
                        email: email
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (_, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            _fixture.Today
        );

        Assert.Equal(AdmissionInvitation.Sent, admission.Invitation);
        await ctx
            .Expected.LiveInvitationOfPerson(admission.PersonId)
            .ToBeIssuedAs(
                InvitationChannel.Mail,
                isReminder: false,
                ctx.Identity.BootstrapAdmin.PersonId
            )
            .AssertAsync(ct);
        var mail = await _fixture.Mailbox.SingleMailToAsync(email, ct);
        Assert.False(string.IsNullOrEmpty(mail.LinkToken()));
    }

    [Fact]
    public async Task Should_LeaveTheInvitationForLater_When_HerMembershipStartsInTheFuture()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var startsOn = _fixture.Today.AddDays(40);

        var (response, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            startsOn
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AdmissionInvitation.NotYetAffiliated, admission.Invitation);
        await ctx
            .Expected.Membership(admission.MembershipId)
            .ToHavePeriod(startsOn, null)
            .InvitationsOfPerson(admission.PersonId)
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAdmission_When_ItIsDatedBeforeSheApplied()
    {
        var ct = TestContext.Current.CancellationToken;
        var confirmedAt = _fixture.TimeProvider.GetUtcNow() - TimeSpan.FromDays(3);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        _fixture.Today.AddYears(-30),
                        confirmedAt: confirmedAt
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");

        var (response, _) = await AdmitAsync(
            admin,
            applicationId,
            personId: null,
            _fixture.Today.AddDays(-4)
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.MembershipApplication(applicationId).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAdmission_When_AMinorsGuardianConsentIsNotConfirmed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication("mia", _fixture.Today.AddYears(-16))
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");

        var (response, _) = await AdmitAsync(admin, applicationId, personId: null, _fixture.Today);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.MembershipApplication(applicationId).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RecordTheGuardianConsentWithItsAuthor_When_AMinorIsAdmitted()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication("mia", _fixture.Today.AddYears(-16))
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            _fixture.Today,
            guardianConsentConfirmed: true
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(admission.MembershipId)
            .ToRecordAdmission(
                ctx.Identity.BootstrapAdmin.PersonId,
                _fixture.TimeProvider.GetUtcNow(),
                guardianConsentConfirmed: true
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AskNoGuardianConsent_When_SheTurns18BeforeTheAdmissionDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        _fixture.Today.AddYears(-18).AddDays(10)
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            _fixture.Today.AddDays(10),
            guardianConsentConfirmed: true
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(admission.MembershipId)
            .ToRecordAdmission(
                ctx.Identity.BootstrapAdmin.PersonId,
                _fixture.TimeProvider.GetUtcNow(),
                guardianConsentConfirmed: false
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_FillOnlyWhatTheRegistryLacks_When_SheIsAdmittedOnAFormerMember()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia-registry", "Mia", "Schwarzwälder-Kunz")
                        .AddPersonContact("mia-registry", email: email)
                        .AddMembership(
                            "mia-before",
                            "mia-registry",
                            _fixture.Today.AddYears(-8),
                            _fixture.Today.AddYears(-3)
                        )
                        .AddMembershipApplication("mia", birthDate, email: email.ToUpperInvariant())
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var personId = ctx.Identity.People.IdOf("mia-registry");

        var (response, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(personId, admission.PersonId);
        await ctx
            .Expected.Person(personId)
            .ToHaveName("Mia", "Schwarzwälder-Kunz")
            .Person(personId)
            .ToHaveBirthDate(birthDate)
            .Person(personId)
            .ToHaveContactDetails(email, "0221 987654", "Rosenweg 12a", "50667", "Köln")
            .Person(personId)
            .ToHaveContactChangedBy(
                ctx.Identity.BootstrapAdmin.PersonId,
                _fixture.TimeProvider.GetUtcNow()
            )
            .Membership(ctx.Identity.Memberships.IdOf("mia-before"))
            .ToHavePeriod(_fixture.Today.AddYears(-8), _fixture.Today.AddYears(-3))
            .Membership(admission.MembershipId)
            .ToHavePeriod(_fixture.Today, null)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepWhatTheRegistryHolds_When_SheIsAdmittedOnAKnownPerson()
    {
        var ct = TestContext.Current.CancellationToken;
        var birthDate = _fixture.Today.AddYears(-30);
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia-registry", "Mia", "Schwarzwälder")
                        .AddPersonContact(
                            "mia-registry",
                            email: email,
                            phone: "0228 111222",
                            city: "Bonn",
                            birthDate: birthDate
                        )
                        .AddMembershipApplication("mia", birthDate)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var personId = ctx.Identity.People.IdOf("mia-registry");

        var (response, _) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Person(personId)
            .ToHaveContactDetails(email, "0228 111222", null, null, "Bonn")
            .Person(personId)
            .ToHaveNoContactChange()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAdmission_When_ThePersonIsAlreadyAMember()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPersonContact("mia-registry", email: email)
                        .AddMembership("mia-running", "mia-registry", _fixture.Today.AddYears(-2))
                        .AddMembershipApplication("mia", _fixture.Today.AddYears(-30), email: email)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");
        var personId = ctx.Identity.People.IdOf("mia-registry");

        var (response, _) = await AdmitAsync(admin, applicationId, personId, _fixture.Today);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MembershipApplication(applicationId)
            .ToExist()
            .MembershipsOfPerson(personId)
            .ToHaveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheAdmission_When_ThePersonSharesNeitherHerEmailNorHerNameAndBirthDate()
    {
        var ct = TestContext.Current.CancellationToken;
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("lena", "Lena", "Schwarzwälder")
                        .AddPersonContact("lena", birthDate: birthDate)
                        .AddMembershipApplication("mia", birthDate)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");
        var personId = ctx.Identity.People.IdOf("lena");

        var (response, _) = await AdmitAsync(admin, applicationId, personId, _fixture.Today);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.MembershipApplication(applicationId)
            .ToExist()
            .MembershipsOfPerson(personId)
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AdmitHerOnTheKnownPerson_When_TheRegistryHoldsHerNameAndBirthDateUnderAnotherSpelling()
    {
        var ct = TestContext.Current.CancellationToken;
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia-registry", "MIA", "Schwarzwaelder")
                        .AddPersonContact("mia-registry", birthDate: birthDate)
                        .AddMembershipApplication("mia", birthDate)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var personId = ctx.Identity.People.IdOf("mia-registry");

        var (response, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(personId, admission.PersonId);
    }

    [Fact]
    public async Task Should_InviteNobody_When_TheKnownPersonAlreadyHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPersonContact("mia-registry", email: email)
                        .AddAccount("mia-registry")
                        .AddMembershipApplication("mia", _fixture.Today.AddYears(-30), email: email)
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var personId = ctx.Identity.People.IdOf("mia-registry");

        var (response, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(AdmissionInvitation.AlreadyHasAccount, admission.Invitation);
        await ctx.Expected.InvitationsOfPerson(personId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_InviteHerAtOnce_When_SheIsAlreadyInAGroupAndHerMembershipStartsLater()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mia-registry", "Mia", "Schwarzwälder")
                            .AddPersonContact("mia-registry", email: email)
                            .AddMembershipApplication(
                                "mia",
                                _fixture.Today.AddYears(-30),
                                email: email
                            )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "mia-tanzgarde",
                                "tanzgarde",
                                "mia-registry",
                                _fixture.Today.AddYears(-1)
                            )
                    ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (_, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            ctx.Identity.People.IdOf("mia-registry"),
            _fixture.Today.AddDays(40)
        );

        Assert.Equal(AdmissionInvitation.Sent, admission.Invitation);
        await _fixture.Mailbox.SingleMailToAsync(email, ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheApplicantHasNotConfirmedIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        _fixture.Today.AddYears(-30),
                        unconfirmed: true
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");

        var (response, _) = await AdmitAsync(admin, applicationId, personId: null, _fixture.Today);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx.Expected.MembershipApplication(applicationId).ToExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheApplicationIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var admin = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await AdmitAsync(
            admin,
            UnknownApplicationId,
            personId: null,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_AdmitHer_When_TheCallerOnlyDecidesApplications()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("anna")
                            .AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "aufnahme",
                            "anna-aufnahme",
                            "Aufnahme",
                            "anna",
                            FurriaPermissions.MembershipApplicationsDecide
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("anna", ct);

        var (response, admission) = await AdmitAsync(
            client,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            _fixture.Today
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.Membership(admission.MembershipId)
            .ToRecordAdmission(
                ctx.Identity.People.IdOf("anna"),
                _fixture.TimeProvider.GetUtcNow(),
                guardianConsentConfirmed: false
            )
            .LiveInvitationOfPerson(admission.PersonId)
            .ToBeIssuedAs(
                InvitationChannel.Mail,
                isReminder: false,
                ctx.Identity.People.IdOf("anna")
            )
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyManagesPersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("paul")
                            .AddMembershipApplication("mia", _fixture.Today.AddYears(-30))
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "paul-personenpflege",
                            "Personenpflege",
                            "paul",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("paul", ct);
        var applicationId = ctx.Identity.MembershipApplications.IdOf("mia");

        var (response, _) = await AdmitAsync(client, applicationId, personId: null, _fixture.Today);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.MembershipApplication(applicationId).ToExist().AssertAsync(ct);
    }

    private static Task<TestResult<AdmitMembershipApplicationResponse>> AdmitAsync(
        HttpClient client,
        int membershipApplicationId,
        int? personId,
        DateOnly admittedOn,
        bool guardianConsentConfirmed = false
    ) =>
        client.POSTAsync<
            AdmitMembershipApplication,
            AdmitMembershipApplicationRequest,
            AdmitMembershipApplicationResponse
        >(
            new AdmitMembershipApplicationRequest
            {
                MembershipApplicationId = membershipApplicationId,
                PersonId = personId,
                AdmittedOn = admittedOn,
                GuardianConsentConfirmed = guardianConsentConfirmed,
            }
        );
}
