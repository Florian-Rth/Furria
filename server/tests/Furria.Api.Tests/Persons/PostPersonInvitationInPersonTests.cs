using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Auth;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class PostPersonInvitationInPersonTests
{
    private const string ConflictField = "conflict";
    private const string CodePattern = "^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$";
    private const int UnknownPersonId = 999_999;

    private readonly ApiTestFixture _fixture;

    public PostPersonInvitationInPersonTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnTheLinkAndTheCodeForFifteenMinutes_When_SheIsEligible()
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

        Assert.StartsWith(
            $"{ApiTestFixture.ClubAppBaseUrl}/invitation#token=",
            issued.Link,
            StringComparison.Ordinal
        );
        Assert.Matches(CodePattern, issued.Code);
        Assert.Equal(_fixture.TimeProvider.GetUtcNow().AddMinutes(15), issued.ExpiresAt);
        await ctx
            .Expected.InvitationsOfPerson(annaId)
            .ToHaveCount(1)
            .InvitationsOfPerson(annaId)
            .ToHaveLiveCountOn(InvitationChannel.InPerson, 1)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeadToTheSameInvitation_When_TheLinkOrTheCodeIsUsed()
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
        var issued = await InvitationSteps.InviteInPersonAsync(
            manager,
            ctx.Identity.People.IdOf("anna")
        );
        var anonymous = _fixture.CreateClient();

        var (_, byLink) = await InvitationSteps.LookUpAsync(
            anonymous,
            InvitationSteps.TokenOf(issued.Link)
        );
        var (_, byCode) = await InvitationSteps.LookUpByCodeAsync(anonymous, issued.Code);

        Assert.Equal(InvitationLookupStatus.Live, byLink.Status);
        Assert.Equal(byLink, byCode);
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

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
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);
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
    public async Task Should_ReturnConflict_When_HerBirthDateIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact("anna", InvitationSteps.UniqueContactEmail("anna"))
                        .AddMembership("anna-membership", "anna", _fixture.Today.AddYears(-1))
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Für Anna ist kein Geburtsdatum hinterlegt.", ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("anna", "Anna", "Muster")
                        .AddPersonContact(
                            "anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            birthDate: _fixture.Today.AddYears(-30)
                        )
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Anna ist nicht im Verein aktiv.", ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_SheAlreadyHasAnAccount()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            _fixture.Today
                        )
                        .AddAccount("anna")
                ),
            ct
        );

        await AssertRefusedAsync(ctx, "anna", "Anna hat bereits einen Zugang.", ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerDoesNotHoldPersonsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddEligiblePerson(
                                "anna",
                                "Anna",
                                InvitationSteps.UniqueContactEmail("anna"),
                                _fixture.Today
                            )
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
        var annaId = ctx.Identity.People.IdOf("anna");
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, _) = await PostAsync(client, annaId);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx.Expected.InvitationsOfPerson(annaId).ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await PostAsync(manager, UnknownPersonId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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

    private static async Task AssertRefusedAsync(
        SeededContext ctx,
        string alias,
        string expectedMessage,
        CancellationToken ct
    )
    {
        var personId = ctx.Identity.People.IdOf(alias);
        var manager = await ctx.Identity.BootstrapAdminClientAsync(ct);

        var (response, _) = await PostAsync(manager, personId);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        Assert.Equal([expectedMessage], payload?.Errors[ConflictField]);
        await ctx.Expected.InvitationsOfPerson(personId).ToHaveCount(0).AssertAsync(ct);
    }
}
