using FastEndpoints;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.Tests.Auth;
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
