using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class GetPersonsTests : IClassFixture<ApiTestFixture>
{
    private const string PersonsRoute = "/api/manage/persons";

    private static readonly DateOnly BornIn1996 = new(1996, 4, 3);
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly LeftIn2023 = new(2023, 1, 1);
    private static readonly DateOnly ArchivedIn2024 = new(2024, 1, 1);

    private static readonly string[] AccessStateFilters =
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
    public async Task Should_LeaveOutArchivedPersons_When_TheRegisterIsReadUnfiltered()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithOneArchivedPersonAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var listed = await ListAllAsync(client);

        Assert.Contains(ctx.Identity.People.IdOf("paula"), listed);
        Assert.DoesNotContain(ctx.Identity.People.IdOf("pia"), listed);
    }

    [Fact]
    public async Task Should_LeaveOutArchivedPersons_When_TheRegisterIsFilteredByAccess()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithOneArchivedPersonAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var listed = await ListByAccessAsync(client, PersonAccessFilters.NotInvitable);

        Assert.Contains(ctx.Identity.People.IdOf("paula"), listed);
        Assert.DoesNotContain(ctx.Identity.People.IdOf("pia"), listed);
    }

    [Fact]
    public async Task Should_ListOnlyArchivedPersons_When_TheArchivedFilterIsSet()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildWithOneArchivedPersonAsync(ct);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest { Archived = true });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [ctx.Identity.People.IdOf("pia")],
            result.Persons.Select(person => person.PersonId)
        );
    }

    private Task<SeededContext> BuildWithOneArchivedPersonAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-erste", "paula", JoinedIn2017, LeftIn2020)
                        .AddPerson("pia", "Pia", "Brendel")
                        .AddMembership("pia-erste", "pia", JoinedIn2017, LeftIn2020)
                        .AddArchive("pia", ArchivedIn2024)
                ),
            ct
        );

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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
    public async Task Should_ListThePersons_When_TheCallerOnlyHoldsAccountsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "zugangspflege",
                            "ilka-zugangspflege",
                            "Zugangspflege",
                            "ilka",
                            FurriaPermissions.AccountsManage
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(
            result.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf("anna")
        );
    }

    [Fact]
    public async Task Should_ListThePersons_When_TheCallerOnlyHoldsPersonsDelete()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Muster")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "loeschung",
                            "ilka-loeschung",
                            "Löschung",
                            "ilka",
                            FurriaPermissions.PersonsDelete
                        )
                    ),
            ct
        );
        var client = await ctx.Identity.ClientForAsync("ilka", ct);

        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains(
            result.Persons,
            person => person.PersonId == ctx.Identity.People.IdOf("anna")
        );
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
                "accessState",
            ],
            fields
        );
        Assert.Equal("active", person.GetProperty("membershipState").GetString());
        Assert.Equal("notInvitable", person.GetProperty("accessState").GetString());
    }

    [Theory]
    [InlineData(PersonAccessFilters.None, "dora", "emil", "gina")]
    [InlineData(PersonAccessFilters.Invited, "carla", "karl")]
    [InlineData(PersonAccessFilters.Active, "anna", "jonas")]
    [InlineData(PersonAccessFilters.Disabled, "bea")]
    [InlineData(PersonAccessFilters.NotInvitable, "fritz", "hans", "ida")]
    [InlineData(PersonAccessFilters.WithAccess, "anna")]
    [InlineData(PersonAccessFilters.OpenInvitation, "carla", "karl")]
    [InlineData(PersonAccessFilters.WithoutEmail, "emil")]
    [InlineData(PersonAccessFilters.BirthDateUnknown, "hans")]
    public async Task Should_ListOnlyThePersonsInThatAccessState_When_TheRegistryIsFilteredByAccess(
        string access,
        params string[] expectedAliases
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["carla"]);
        await InvitationSteps.InviteAsync(client, ids["karl"]);

        var listed = await ListByAccessAsync(client, access);

        Assert.Equal(
            expectedAliases.Order(StringComparer.Ordinal),
            ids.Where(entry => listed.Contains(entry.Value))
                .Select(entry => entry.Key)
                .Order(StringComparer.Ordinal)
        );
    }

    [Theory]
    [InlineData("anna", RegisterAccessState.Active)]
    [InlineData("bea", RegisterAccessState.Disabled)]
    [InlineData("carla", RegisterAccessState.Invited)]
    [InlineData("dora", RegisterAccessState.None)]
    [InlineData("emil", RegisterAccessState.None)]
    [InlineData("fritz", RegisterAccessState.NotInvitable)]
    [InlineData("hans", RegisterAccessState.NotInvitable)]
    [InlineData("ida", RegisterAccessState.NotInvitable)]
    [InlineData("jonas", RegisterAccessState.Active)]
    [InlineData("karl", RegisterAccessState.Invited)]
    public async Task Should_CarryHerAccessState_When_TheRegistryIsListed(
        string alias,
        RegisterAccessState expected
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["carla"]);
        await InvitationSteps.InviteAsync(client, ids["karl"]);

        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            expected,
            result.Persons.Single(person => person.PersonId == ids[alias]).AccessState
        );
    }

    [Fact]
    public async Task Should_CarryTheStateItIsFilteredBy_When_TheRegistryIsFilteredByAnAccessState()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["carla"]);

        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest { Access = PersonAccessFilters.Disabled });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var disabled = Assert.Single(result.Persons);
        Assert.Equal(RegisterAccessState.Disabled, disabled.AccessState);
        Assert.Equal(MembershipState.Active, disabled.MembershipState);
    }

    [Fact]
    public async Task Should_AgreeWithEachPersonsAccessPanel_When_EveryStateAndReasonIsPresent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["gina"]);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromDays(20),
            async () =>
            {
                var laterClient = await ctx.Identity.ManagingLoginClientAsync(ct);
                await InvitationSteps.InviteAsync(laterClient, ids["carla"]);
                await InvitationSteps.InviteAsync(laterClient, ids["karl"]);

                foreach (var access in AccessStateFilters)
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
    public async Task Should_FileEveryPersonUnderExactlyOneAccessState_When_AVouchedPersonIsInvited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildEveryAccessStateAsync(ct);
        var ids = SeededAccessIdsOf(ctx);
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["carla"]);
        await InvitationSteps.InviteAsync(client, ids["karl"]);

        var everyone = await ListAllAsync(client);
        var filings = new Dictionary<int, List<string>>();
        foreach (var access in AccessStateFilters)
        foreach (var personId in await ListByAccessAsync(client, access))
        {
            if (!filings.TryGetValue(personId, out var filed))
                filings[personId] = filed = [];
            filed.Add(access);
        }

        Assert.Equal(everyone.Order(), filings.Keys.Order());
        Assert.All(filings, filing => Assert.Single(filing.Value));
        Assert.Equal([PersonAccessFilters.Invited], filings[ids["karl"]]);
    }

    [Fact]
    public async Task Should_ListThePerson_When_FilteringByBirthDateUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("hans", "Hans", "Muster")
                            .AddPersonContact("hans", InvitationSteps.UniqueContactEmail("hans"))
                            .AddMembership("hans-membership", "hans", today.AddYears(-1))
                            .AddPerson("lea", "Lea", "Muster")
                            .AddPerson("tom", "Tom", "Kartenkäufer")
                            .AddPerson("jonas", "Jonas", "Muster")
                            .AddMembership("jonas-membership", "jonas", today.AddYears(-1))
                            .AddAccount("jonas")
                            .AddPerson("fritz", "Fritz", "Muster")
                            .AddPersonContact("fritz", birthDate: today.AddYears(-30))
                            .AddMembership("fritz-membership", "fritz", today.AddYears(-1))
                            .AddPerson("otto", "Otto", "Muster")
                            .AddMembership(
                                "otto-membership",
                                "otto",
                                today.AddYears(-3),
                                today.AddYears(-1)
                            )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "lea-tanzgarde",
                                "tanzgarde",
                                "lea",
                                today.AddYears(-1)
                            )
                    ),
            ct
        );
        var ids = new Dictionary<string, int>(StringComparer.Ordinal)
        {
            ["hans"] = ctx.Identity.People.IdOf("hans"),
            ["lea"] = ctx.Identity.People.IdOf("lea"),
            ["tom"] = ctx.Identity.People.IdOf("tom"),
            ["jonas"] = ctx.Identity.People.IdOf("jonas"),
            ["fritz"] = ctx.Identity.People.IdOf("fritz"),
            ["otto"] = ctx.Identity.People.IdOf("otto"),
        };
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);

        var listed = await ListByAccessAsync(client, PersonAccessFilters.BirthDateUnknown);

        Assert.Equal(["hans", "lea"], AliasesOf(ids, listed));
    }

    [Fact]
    public async Task Should_LeaveOutThePerson_When_SheHasAnOpenInvitation()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("hans", "Hans", "Muster")
                        .AddPersonContact("hans", InvitationSteps.UniqueContactEmail("hans"))
                        .AddMembership("hans-membership", "hans", today.AddYears(-1))
                        .AddPerson("karl", "Karl", "Muster")
                        .AddPersonContact("karl", InvitationSteps.UniqueContactEmail("karl"))
                        .AddMembership("karl-membership", "karl", today.AddYears(-1))
                ),
            ct
        );
        var ids = new Dictionary<string, int>(StringComparer.Ordinal)
        {
            ["hans"] = ctx.Identity.People.IdOf("hans"),
            ["karl"] = ctx.Identity.People.IdOf("karl"),
        };
        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        await InvitationSteps.InviteAsync(client, ids["karl"]);

        var listed = await ListByAccessAsync(client, PersonAccessFilters.BirthDateUnknown);

        Assert.Equal(["hans"], AliasesOf(ids, listed));
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheAccessFilterIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
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
                        .AddPerson("jonas", "Jonas", "Muster")
                        .AddAccount("jonas")
                        .AddPerson("karl", "Karl", "Muster")
                        .AddPersonContact("karl", InvitationSteps.UniqueContactEmail("karl"))
                        .AddMembership("karl-membership", "karl", today.AddYears(-1))
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
            ["jonas"] = ctx.Identity.People.IdOf("jonas"),
            ["karl"] = ctx.Identity.People.IdOf("karl"),
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

    private static IEnumerable<string> AliasesOf(
        IReadOnlyDictionary<string, int> ids,
        IReadOnlySet<int> listed
    ) =>
        ids.Where(entry => listed.Contains(entry.Value))
            .Select(entry => entry.Key)
            .Order(StringComparer.Ordinal);

    private static async Task<IReadOnlySet<int>> ListAllAsync(HttpClient client)
    {
        var (response, result) = await client.GETAsync<
            GetPersons,
            GetPersonsRequest,
            GetPersonsResponse
        >(new GetPersonsRequest());

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
