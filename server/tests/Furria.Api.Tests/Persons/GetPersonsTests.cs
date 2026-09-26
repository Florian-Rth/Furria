using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

[Collection("Api")]
public sealed class GetPersonsTests
{
    private const string PersonsRoute = "/api/manage/persons";

    private static readonly DateOnly BornIn1996 = new(1996, 4, 3);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly LeftIn2023 = new(2023, 1, 1);
    private static readonly DateOnly ArchivedIn2024 = new(2024, 1, 1);

    private static readonly string[] AllAccessFilters =
    [
        PersonAccessFilters.None,
        PersonAccessFilters.Invited,
        PersonAccessFilters.Active,
        PersonAccessFilters.Disabled,
        PersonAccessFilters.NotInvitable,
    ];

    private readonly ApiTestFixture _fixture;

    public GetPersonsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ContainHer_When_APersonHasNoTieToTheClubAtAll()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity => identity.AddPerson("tom", "Tom", "Kartenkäufer")),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tom = Assert.Single(
            result.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf("tom")
        );
        Assert.Equal("Tom", tom.FirstName);
        Assert.Equal("Kartenkäufer", tom.LastName);
    }

    [Fact]
    public async Task Should_CarryTheAddressAndTheBirthDate_When_TheRegistryIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddPersonContact(
                            "alice",
                            "alice@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra",
                            contactVisibleToMembers: true,
                            BornIn1996
                        )
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var alice = Assert.Single(
            result.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf("alice")
        );
        Assert.Equal("alice@example.test", alice.Email);
        Assert.Equal("0170 1234567", alice.Phone);
        Assert.Equal("Hauptstraße 12", alice.Street);
        Assert.Equal("99713", alice.Zip);
        Assert.Equal("Großfurra", alice.City);
        Assert.Equal(BornIn1996, alice.BirthDate);
        Assert.True(alice.ContactVisibleToMembers);
    }

    [Fact]
    public async Task Should_ReportEndedAndTheChainMinimum_When_AFormerMemberRejoinedAndLeftAgain()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("frank", "Frank", "Ehemalig")
                        .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                        .AddMembership("frank-again", "frank", RejoinedIn2021, LeftIn2023)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var frank = Assert.Single(
            result.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf("frank")
        );
        Assert.Equal(MembershipState.Ended, frank.MembershipState);
        Assert.Equal(JoinedIn2017, frank.MemberSince);
    }

    [Fact]
    public async Task Should_NameOnlyTheRunningGroupsAndRoles_When_EndedAndArchivedOnesExistToo()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("paula", "Paula", "Brendel"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2024
                            )
                            .AddGroup("marschmusik", "Marschmusik")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership("paula-showtanz", "showtanz", "paula", JoinedIn2017)
                            .AddGroupMembership(
                                "paula-marschmusik",
                                "marschmusik",
                                "paula",
                                JoinedIn2017
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("kassenpruefung", "Kassenpruefung")
                            .AddRoleHolding(
                                "paula-kassenpruefung",
                                "kassenpruefung",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddRoleWithDetails(
                                "schriftfuehrung",
                                "Schriftfuehrung",
                                "Aufgeloest.",
                                ArchivedIn2024
                            )
                            .AddRoleHolding(
                                "paula-schriftfuehrung",
                                "schriftfuehrung",
                                "paula",
                                JoinedIn2017
                            )
                            .AddRole("gruppenpflege", "Gruppenpflege")
                            .AddRoleHolding(
                                "paula-gruppenpflege",
                                "gruppenpflege",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf("paula")
        );
        var marschmusik = Assert.Single(paula.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("marschmusik"), marschmusik.GroupId);
        Assert.Equal("Marschmusik", marschmusik.Name);
        var groupCare = Assert.Single(paula.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("gruppenpflege"), groupCare.RoleId);
        Assert.Equal("Gruppenpflege", groupCare.Name);
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
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
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
        var (response, _) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetPersons, GetPersonsRequest, GetPersonsResponse>(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_ListingThePersons()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("kuehnel", "Katrin", "Kühnel")
                        .AddPerson("kuhn", "Karl", "Kuhn")
                        .AddPerson("oesterreicher", "Ole", "Österreicher")
                        .AddPerson("zimmermann", "Zoe", "Zimmermann")
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var surnames = result
            .Persons.Select(person => person.LastName)
            .Where(name => name is "Kuhn" or "Kühnel" or "Österreicher" or "Zimmermann")
            .ToArray();
        Assert.Equal(["Kuhn", "Kühnel", "Österreicher", "Zimmermann"], surnames);
        Assert.Contains(
            result.Persons,
            person => person.PersonId == ctx.Identity.BootstrapAdmin.PersonId
        );
    }

    [Fact]
    public async Task Should_CarryTheAddressAndTheStateAsAString_When_TheListIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var payload = await client.GetStringAsync(PersonsRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var person = document
            .RootElement.GetProperty("persons")
            .EnumerateArray()
            .Single(row => row.GetProperty("lastName").GetString() == "Muster");
        var fields = person.EnumerateObject().Select(field => field.Name).ToArray();
        Assert.Equal(
            [
                "personId",
                "firstName",
                "lastName",
                "email",
                "phone",
                "street",
                "zip",
                "city",
                "birthDate",
                "contactVisibleToMembers",
                "membershipState",
                "memberSince",
                "groups",
                "roles",
            ],
            fields
        );
        Assert.Equal("active", person.GetProperty("membershipState").GetString());
    }

    [Theory]
    [InlineData(PersonAccessFilters.None, "dora", "gina")]
    [InlineData(PersonAccessFilters.Invited, "carla")]
    [InlineData(PersonAccessFilters.Active, "anna")]
    [InlineData(PersonAccessFilters.Disabled, "bea")]
    [InlineData(PersonAccessFilters.NotInvitable, "emil", "fritz", "hans", "ida")]
    public async Task Should_ListOnlyThePersonsInThatAccessState_When_TheRegistryIsFilteredByAccess(
        string access,
        params string[] expectedAliases
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["carla"]);

        var listed = await ListByAccessAsync(client, access);

        Assert.Equal(
            expectedAliases.Order(StringComparer.Ordinal),
            ids.Where(entry => listed.Contains(entry.Value))
                .Select(entry => entry.Key)
                .Order(StringComparer.Ordinal)
        );
    }

    [Fact]
    public async Task Should_AgreeWithEachPersonsAccessPanel_When_EveryStateAndReasonIsPresent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["gina"]);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(20),
            async () =>
            {
                var laterClient = await ctx.Identity.BootstrapAdminClientAsync(ct);
                await InvitationSteps.InviteAsync(laterClient, ids["carla"]);

                foreach (var access in AllAccessFilters)
                {
                    var listed = await ListByAccessAsync(laterClient, access);
                    foreach (var (alias, personId) in ids)
                    {
                        var expected = await AccessFilterFromPanelAsync(laterClient, personId);
                        Assert.True(
                            listed.Contains(personId) == (expected == access),
                            $"{alias} is filed under {expected}, but the {access} filter disagrees."
                        );
                    }
                }
            }
        );
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheAccessFilterIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, _) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest { Access = "everyone" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private Task<SeededContext> BuildEveryAccessStateAsync(CancellationToken ct)
    {
        var today = _fixture.Today;

        return _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddEligiblePerson(
                            "anna",
                            "Anna",
                            InvitationSteps.UniqueContactEmail("anna"),
                            today
                        )
                        .AddAccount("anna")
                        .AddEligiblePerson(
                            "bea",
                            "Bea",
                            InvitationSteps.UniqueContactEmail("bea"),
                            today
                        )
                        .AddAccount("bea", disabled: true)
                        .AddEligiblePerson(
                            "carla",
                            "Carla",
                            InvitationSteps.UniqueContactEmail("carla"),
                            today
                        )
                        .AddEligiblePerson(
                            "dora",
                            "Dora",
                            InvitationSteps.UniqueContactEmail("dora"),
                            today
                        )
                        .AddPerson("emil", "Emil", "Muster")
                        .AddPersonContact(
                            "emil",
                            birthDate: today.AddYears(-30),
                            withoutEmail: true
                        )
                        .AddMembership("emil-membership", "emil", today.AddYears(-1))
                        .AddPerson("fritz", "Fritz", "Muster")
                        .AddPersonContact(
                            "fritz",
                            InvitationSteps.UniqueContactEmail("fritz"),
                            birthDate: today.AddYears(-30)
                        )
                        .AddEligiblePerson(
                            "gina",
                            "Gina",
                            InvitationSteps.UniqueContactEmail("gina"),
                            today
                        )
                        .AddPerson("hans", "Hans", "Muster")
                        .AddPersonContact("hans", InvitationSteps.UniqueContactEmail("hans"))
                        .AddMembership("hans-membership", "hans", today.AddYears(-1))
                        .AddPerson("ida", "Ida", "Muster")
                        .AddPersonContact(
                            "ida",
                            InvitationSteps.UniqueContactEmail("ida"),
                            birthDate: today.AddYears(-10)
                        )
                        .AddMembership("ida-membership", "ida", today.AddYears(-1))
                ),
            ct
        );
    }

    private static Dictionary<string, int> SeededAccessIdsOf(SeededContext ctx) =>
        new(StringComparer.Ordinal)
        {
            ["anna"] = ctx.Identity.People.IdOf("anna"),
            ["bea"] = ctx.Identity.People.IdOf("bea"),
            ["carla"] = ctx.Identity.People.IdOf("carla"),
            ["dora"] = ctx.Identity.People.IdOf("dora"),
            ["emil"] = ctx.Identity.People.IdOf("emil"),
            ["fritz"] = ctx.Identity.People.IdOf("fritz"),
            ["gina"] = ctx.Identity.People.IdOf("gina"),
            ["hans"] = ctx.Identity.People.IdOf("hans"),
            ["ida"] = ctx.Identity.People.IdOf("ida"),
        };

    private static async Task<IReadOnlySet<int>> ListByAccessAsync(HttpClient client, string access)
    {
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest { Access = access });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result.Persons.Select(person => person.PersonId).ToHashSet();
    }

    private static async Task<string> AccessFilterFromPanelAsync(HttpClient client, int personId)
    {
        var (response, result) = await client.GETAsync<
            GetPersonById,
            GetPersonByIdRequest,
            GetPersonByIdResponse
        >(new GetPersonByIdRequest { PersonId = personId });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result.Access switch
        {
            { State: AccountAccessState.Active } => PersonAccessFilters.Active,
            { State: AccountAccessState.Disabled } => PersonAccessFilters.Disabled,
            { State: AccountAccessState.Invited } => PersonAccessFilters.Invited,
            { Reason: null } => PersonAccessFilters.None,
            _ => PersonAccessFilters.NotInvitable,
        };
    }
}
