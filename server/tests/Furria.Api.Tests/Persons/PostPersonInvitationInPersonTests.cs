using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class PostPersonInvitationInPersonTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";

    private readonly ApiTestFixture _fixture;

    public PostPersonInvitationInPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_KillTheMailedLink_When_SheIsShownACodeInPerson()
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
        var mailedToken = await InvitationSteps.InviteAndReadTokenAsync(
            _fixture,
            manager,
            annaId,
            annaEmail,
            ct
        );

        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var anonymous = _fixture.CreateClient();
        var (_, mailed) = await InvitationSteps.LookUpAsync(anonymous, mailedToken);
        var (_, inPerson) = await InvitationSteps.LookUpByCodeAsync(anonymous, issued.Code);
        Assert.Equal(InvitationLookupStatus.Dead, mailed.Status);
        Assert.Equal(InvitationLookupStatus.Live, inPerson.Status);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(2)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCountOn(InvitationChannel.InPerson, 1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCount(1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KillTheFirstCode_When_ANewCodeIsIssued()
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);

        var first = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        var second = await InvitationSteps.InviteInPersonAsync(manager, annaId);

        var anonymous = _fixture.CreateClient();
        var (_, firstLookup) = await InvitationSteps.LookUpByCodeAsync(anonymous, first.Code);
        var (_, secondLookup) = await InvitationSteps.LookUpByCodeAsync(anonymous, second.Code);
        Assert.NotEqual(first.Link, second.Link);
        Assert.Equal(InvitationLookupStatus.Dead, firstLookup.Status);
        Assert.Equal(InvitationLookupStatus.Live, secondLookup.Status);
        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveLiveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NeverShowTheCodeOrTheLinkAgain_When_HerAccessIsReadAfterwards()
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
        var manager = await ctx.Identity.ManagingLoginClientAsync(ct);
        var issued = await InvitationSteps.InviteInPersonAsync(manager, annaId);
        var token = InvitationSteps.TokenOf(issued.Link);
        var bareCode = issued.Code.Replace("-", "", StringComparison.Ordinal);

        var (personResponse, _) = await manager.GETAsync<
            GetPersonById,
            GetPersonByIdRequest,
            GetPersonByIdResponse
        >(new GetPersonByIdRequest { PersonId = annaId });
        var (stateResponse, _) = await manager.GETAsync<
            GetPersonAccessState,
            GetPersonAccessStateRequest,
            GetPersonAccessStateResponse
        >(new GetPersonAccessStateRequest { PersonId = annaId });

        foreach (
            var body in new[]
            {
                await personResponse.Content.ReadAsStringAsync(ct),
                await stateResponse.Content.ReadAsStringAsync(ct),
            }
        )
        {
            Assert.DoesNotContain(issued.Code, body, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain(bareCode, body, StringComparison.OrdinalIgnoreCase);
            Assert.DoesNotContain(token, body, StringComparison.Ordinal);
        }
    }

    [Fact]
    public async Task Should_ReturnConflict_When_HerBirthDateIsUnknownAndTheCallerCannotVouch()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddPersonContact("anna", InvitationSteps.UniqueContactEmail("anna"))
                            .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "personenpflege",
                            "ilka-personenpflege",
                            "Personenpflege",
                            "ilka",
                            FurriaPermissions.PersonsManage
                        )
                    ),
            ct
        );
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, _) = await PostAsync(client, annaId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal(
            ["Für Anna ist kein Geburtsdatum hinterlegt."],
            payload?.Errors[ConflictField]
        );
        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(0).AssertAsync(ct);
    }

    private static Task<TestResult<PostPersonInvitationInPersonResponse>> PostAsync(
        HttpClient client,
        int personId
    ) =>
        client.POSTAsync<
            PostPersonInvitationInPerson,
            PostPersonInvitationInPersonRequest,
            PostPersonInvitationInPersonResponse
        >(new PostPersonInvitationInPersonRequest { PersonId = personId });
}
