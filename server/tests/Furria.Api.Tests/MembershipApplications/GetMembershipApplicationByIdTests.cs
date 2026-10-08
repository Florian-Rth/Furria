using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.MembershipApplications;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class GetMembershipApplicationByIdTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetMembershipApplicationByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ShowEverythingSheGave_When_TheApplicationIsUndecided()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var birthDate = _fixture.Today.AddYears(-30);
        var confirmedAt = _fixture.TimeProvider.GetUtcNow() - TimeSpan.FromDays(2);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        birthDate,
                        "Mia",
                        "Schwarzwälder",
                        email,
                        "0221 987654",
                        confirmedAt
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ctx.Identity.MembershipApplications.IdOf("mia"),
            application.MembershipApplicationId
        );
        Assert.Equal("Mia", application.FirstName);
        Assert.Equal("Schwarzwälder", application.LastName);
        Assert.Equal(birthDate, application.BirthDate);
        Assert.Equal(30, application.Age);
        Assert.False(application.IsMinor);
        Assert.Equal("Rosenweg 12a", application.Street);
        Assert.Equal("50667", application.Zip);
        Assert.Equal("Köln", application.City);
        Assert.Equal(email, application.Email);
        Assert.Equal("0221 987654", application.Phone);
        Assert.Equal(confirmedAt, application.ConfirmedAt);
        Assert.True(application.SubmittedAt <= confirmedAt);
    }

    [Fact]
    public async Task Should_ListAnArchivedPerson_When_SheSharesHerEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mia-registry", "Mia", "Schwarzwälder")
                        .AddPersonContact("mia-registry", email: email)
                        .AddArchive("mia-registry", _fixture.Today.AddYears(-2))
                        .AddMembershipApplication("mia", _fixture.Today.AddYears(-30), email: email)
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        Assert.Equal(
            [ctx.Identity.People.IdOf("mia-registry")],
            application.Candidates.Select(candidate => candidate.PersonId)
        );
    }

    [Fact]
    public async Task Should_MarkTheApplicantMinor_When_SheIsUnder18Today()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddMembershipApplication(
                        "mia",
                        _fixture.Today.AddYears(-16),
                        phone: null
                    )
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        Assert.True(application.IsMinor);
        Assert.Equal(16, application.Age);
        Assert.Null(application.Phone);
    }

    [Fact]
    public async Task Should_DateTheApplicationAndNameTheAgeOfConsent_When_ItIsRead()
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        Assert.Equal(_fixture.Today.AddDays(-3), application.AppliedOn);
        Assert.Equal(16, application.AgeOfConsent);
    }

    [Fact]
    public async Task Should_ListEveryPersonSharingHerEmailOrHerNameAndBirthDate_When_ItIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("mother", "Sabine", "Schwarzwälder")
                        .AddPersonContact("mother", email: email.ToUpperInvariant())
                        .AddPerson("mia-registry", "Mia", "Schwarzwaelder")
                        .AddPersonContact("mia-registry", birthDate: birthDate)
                        .AddPerson("sister", "Lena", "Schwarzwälder")
                        .AddPersonContact("sister", birthDate: birthDate)
                        .AddPerson("namesake", "Mia", "Schwarzwälder")
                        .AddPersonContact("namesake", birthDate: birthDate.AddDays(1))
                        .AddMembershipApplication("mia", birthDate, email: email)
                ),
            ct
        );
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        Assert.Equal(
            new[] { ctx.Identity.People.IdOf("mother"), ctx.Identity.People.IdOf("mia-registry") }
                .Order()
                .ToList(),
            application.Candidates.Select(candidate => candidate.PersonId).Order().ToList()
        );
    }

    [Fact]
    public async Task Should_DescribeWhereACandidateStands_When_SheIsAFormerMemberInAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var email = InvitationSteps.UniqueContactEmail("mia");
        var birthDate = _fixture.Today.AddYears(-30);
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mia-registry", "Mia", "Schwarzwälder")
                            .AddPersonContact("mia-registry", email: email, city: "Bonn")
                            .AddAccount("mia-registry")
                            .AddMembership(
                                "mia-before",
                                "mia-registry",
                                _fixture.Today.AddYears(-8),
                                _fixture.Today.AddYears(-3)
                            )
                            .AddMembershipApplication("mia", birthDate, email: email)
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (_, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        var candidate = Assert.Single(application.Candidates);
        Assert.Equal(ctx.Identity.People.IdOf("mia-registry"), candidate.PersonId);
        Assert.Equal("Mia", candidate.FirstName);
        Assert.Equal("Schwarzwälder", candidate.LastName);
        Assert.Null(candidate.BirthDate);
        Assert.Equal(email, candidate.Email);
        Assert.Equal("Bonn", candidate.City);
        Assert.Equal(MembershipState.Ended, candidate.MembershipState);
        Assert.Equal(_fixture.Today.AddYears(-8), candidate.MemberSince);
        Assert.False(candidate.IsMember);
        Assert.Equal(new[] { "Tanzgarde" }, candidate.Groups);
        Assert.Empty(candidate.Roles);
        Assert.True(candidate.IsAffiliated);
        Assert.True(candidate.HasAccount);
        Assert.Equal(new[] { RegistryGap.BirthDate, RegistryGap.Phone }, candidate.Gaps);
    }

    [Fact]
    public async Task Should_MarkACandidateAMember_When_HerMembershipIsRunning()
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

        var (_, application) = await ReadAsync(
            admin,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        var candidate = Assert.Single(application.Candidates);
        Assert.True(candidate.IsMember);
        Assert.Equal(MembershipState.Active, candidate.MembershipState);
        Assert.False(candidate.HasAccount);
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
        var admin = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, _) = await ReadAsync(admin, ctx.Identity.MembershipApplications.IdOf("mia"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ShowTheApplication_When_TheCallerOnlyDecidesApplications()
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

        var (response, _) = await ReadAsync(
            client,
            ctx.Identity.MembershipApplications.IdOf("mia")
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private static Task<TestResult<GetMembershipApplicationByIdResponse>> ReadAsync(
        HttpClient client,
        int membershipApplicationId
    ) =>
        client.GETAsync<
            GetMembershipApplicationById,
            GetMembershipApplicationByIdRequest,
            GetMembershipApplicationByIdResponse
        >(
            new GetMembershipApplicationByIdRequest
            {
                MembershipApplicationId = membershipApplicationId,
            }
        );
}
