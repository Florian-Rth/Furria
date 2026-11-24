using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Tests.Auth;
using Furria.Application.MembershipApplications;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class AdmitMembershipApplicationTests : IClassFixture<ApiTestFixture>
{
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
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
    public async Task Should_LiftHerArchive_When_SheIsAdmittedOnAnArchivedFormerMember()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia-registry", "Mia", "Schwarzwälder")
                        .AddPersonContact("mia-registry", email: email)
                        .AddMembership(
                            "mia-before",
                            "mia-registry",
                            _fixture.Today.AddYears(-8),
                            _fixture.Today.AddYears(-3)
                        )
                        .AddArchive("mia-registry", _fixture.Today.AddYears(-2))
                        .AddMembershipApplication("mia", _fixture.Today.AddYears(-30), email: email)
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
        var personId = ctx.Identity.People.IdOf("mia-registry");

        var (response, _) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId,
            _fixture.Today.AddMonths(1)
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.Person(personId).ToNotBeArchived().AssertAsync(ct);
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, admission) = await AdmitAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia"),
            personId: null,
            _fixture.Today
        );

        Assert.Equal(AdmissionInvitation.Sent, admission.Invitation);
        await ctx
            .Expected.LiveInvitationOfPerson(admission.PersonId)
            .ToBeIssuedAs(InvitationChannel.Mail, isReminder: false, issuedByPersonId: null)
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);
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

    private static Task<TestResult<AdmitMembershipApplicationResponse>> AdmitAsync(
        HttpClient client,
        int membershipApplicationId,
        int? personId,
        DateOnly admittedOn
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
                GuardianConsentConfirmed = false,
            }
        );
}
