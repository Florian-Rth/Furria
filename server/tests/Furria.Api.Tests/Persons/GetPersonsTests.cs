using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Persons;
using Furria.Api.Tests.Auth;
using Furria.Core.Club;
using Furria.Core.Identity;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Persons;

public sealed class GetPersonsTests : IClassFixture<ApiTestFixture>
{
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

    [Fact]
    public async Task Should_MarkTheFeeReduction_When_OneRunsThisSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var sessionYear = _fixture.CurrentSessionYear;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("lena", "Lena", "Studentin")
                        .AddFeeReduction(
                            "lena-studies",
                            "lena",
                            FeeReductionBasis.Studies,
                            sessionYear - 1,
                            sessionYear
                        )
                        .AddPerson("otto", "Otto", "Ehemals")
                        .AddFeeReduction(
                            "otto-school",
                            "otto",
                            FeeReductionBasis.School,
                            sessionYear - 3,
                            sessionYear - 1
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ManagingLoginClientAsync(ct);
        var (_, result) = await client.GETAsync<GetPersons, GetPersonsRequest, GetPersonsResponse>(
            new GetPersonsRequest()
        );

        Assert.True(
            result
                .Persons.Single(person => person.PersonId == ctx.Identity.People.IdOf("lena"))
                .FeeReduced
        );
        Assert.False(
            result
                .Persons.Single(person => person.PersonId == ctx.Identity.People.IdOf("otto"))
                .FeeReduced
        );
    }
}
