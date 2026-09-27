using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class GetPersonAdoptionCandidateTests
{
    private readonly ApiTestFixture _fixture;

    public GetPersonAdoptionCandidateTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_NameThePersonOutsideTheClub_When_SheHoldsTheTypedEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", annaEmail)
                        .AddAccount("anna")
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, candidate) = await FindCandidateAsync(
            manager,
            $"  {annaEmail.ToUpperInvariant()} "
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), candidate.PersonId);
        Assert.Equal("Anna", candidate.FirstName);
        Assert.Equal("Muster", candidate.LastName);
        Assert.True(candidate.HasAccount);
    }

    [Fact]
    public async Task Should_ReportNoAccount_When_TheCandidateHasNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddPerson("anna", "Anna", "Muster").AddPersonContact("anna", annaEmail)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, candidate) = await FindCandidateAsync(manager, annaEmail);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), candidate.PersonId);
        Assert.False(candidate.HasAccount);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_NobodyHoldsTheEmail()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await FindCandidateAsync(
            manager,
            InvitationSteps.UniqueContactEmail("niemand")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheOnlyHolderOfTheEmailIsAffiliated()
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

        var (response, _) = await FindCandidateAsync(manager, annaEmail);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_PassOverTheAffiliatedHolder_When_AnotherHolderIsOutsideTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson("bruno", "Bruno", sharedEmail, _fixture.Today)
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", sharedEmail)
                ),
            ct
        );
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, candidate) = await FindCandidateAsync(manager, sharedEmail);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), candidate.PersonId);
    }

    [Fact]
    public async Task Should_NameTheMostRecentlyChanged_When_SeveralPersonsOutsideTheClubHoldIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var sharedEmail = InvitationSteps.UniqueContactEmail("familie");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", sharedEmail)
                        .AddPerson("bruno", "Bruno", "Muster")
                        .AddPersonContact("bruno", sharedEmail)
                ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(5),
            () => _fixture.EditPersonNameDirectlyAsync(annaId, "Anna", "Muster-Neu", ct)
        );

        var (response, candidate) = await FindCandidateAsync(manager, sharedEmail);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(annaId, candidate.PersonId);
        Assert.Equal("Muster-Neu", candidate.LastName);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheEmailIsNotAnAddress()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await FindCandidateAsync(manager, "keine-adresse");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var annaEmail = InvitationSteps.UniqueContactEmail("anna");
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddPersonContact("anna", annaEmail)
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, _) = await FindCandidateAsync(client, annaEmail);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private static Task<TestResult<GetPersonAdoptionCandidateResponse>> FindCandidateAsync(
        HttpClient client,
        string email
    ) =>
        client.GETAsync<
            GetPersonAdoptionCandidate,
            GetPersonAdoptionCandidateRequest,
            GetPersonAdoptionCandidateResponse
        >(new GetPersonAdoptionCandidateRequest { Email = email });
}
