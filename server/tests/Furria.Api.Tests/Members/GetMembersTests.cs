using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Members;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Members;

[Collection("Api")]
public sealed class GetMembersTests
{
    private const string MembersRoute = "/api/members";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetMembersTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ContainTheCaller_When_AnAffiliatedMemberReadsTheList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var alice = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("alice")
        );
        Assert.Equal("Alice", alice.FirstName);
        Assert.Equal("Muster", alice.LastName);
        Assert.Equal(MembershipState.Active, alice.MembershipState);
    }

    [Fact]
    public async Task Should_ContainHer_When_APersonOnlyBelongsToAGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        Assert.Equal(MembershipState.None, paula.MembershipState);
        var tanzgarde = Assert.Single(paula.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.Empty(paula.Roles);
    }

    [Fact]
    public async Task Should_ContainNeitherOfThem_When_APersonLeftTheVereinOrOnlyBuysTickets()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("frank", "Frank", "Ehemalig")
                        .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                        .AddPerson("tom", "Tom", "Kartenkäufer")
                        .AddAccount("tom")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.DoesNotContain(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("frank")
        );
        Assert.DoesNotContain(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("tom")
        );
    }

    [Fact]
    public async Task Should_ReportBeendet_When_AFormerMitgliedStillDancesInAGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-first", "paula", JoinedIn2017, LeftIn2020)
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        Assert.Equal(MembershipState.Ended, paula.MembershipState);
    }

    [Fact]
    public async Task Should_ReportRuht_When_TheRunningMitgliedschaftPausesThisSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("alice", "Alice", "Muster")
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                        .AddMembershipPause(
                            "alice-ruhezeit",
                            "alice-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var alice = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("alice")
        );
        Assert.Equal(MembershipState.Paused, alice.MembershipState);
    }

    [Fact]
    public async Task Should_ListTheRunningRolle_When_APersonHoldsOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("ilka", "Ilka", "Reineke"))
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

        var client = await ctx.Identity.BootstrapAdminClientAsync(ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var ilka = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("ilka")
        );
        var gruppenpflege = Assert.Single(ilka.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("gruppenpflege"), gruppenpflege.RoleId);
        Assert.Equal("Gruppenpflege", gruppenpflege.Name);
        Assert.Contains(
            result.Members,
            member => member.PersonId == ctx.Identity.BootstrapAdmin.PersonId
        );
    }

    [Fact]
    public async Task Should_OmitTheGruppe_When_TheZugehoerigkeitEndedOrTheGruppeIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2021
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
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        var marschmusik = Assert.Single(paula.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("marschmusik"), marschmusik.GroupId);
    }

    [Fact]
    public async Task Should_OmitTheRolle_When_TheInhaberschaftEndedOrTheRolleIsArchived()
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
                        roles
                            .AddRole("kassenpruefung", "Kassenpruefung")
                            .AddRoleHolding(
                                "ilka-kassenpruefung",
                                "kassenpruefung",
                                "ilka",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddRoleWithDetails(
                                "schriftfuehrung",
                                "Schriftfuehrung",
                                "Aufgeloest.",
                                ArchivedIn2021
                            )
                            .AddRoleHolding(
                                "ilka-schriftfuehrung",
                                "schriftfuehrung",
                                "ilka",
                                JoinedIn2017
                            )
                            .AddRole("gruppenpflege", "Gruppenpflege")
                            .AddRoleHolding(
                                "ilka-gruppenpflege",
                                "gruppenpflege",
                                "ilka",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var ilka = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("ilka")
        );
        var gruppenpflege = Assert.Single(ilka.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("gruppenpflege"), gruppenpflege.RoleId);
    }

    [Fact]
    public async Task Should_NameEachGruppeAndRolleOnce_When_ATieEndedAndANewOneStartedToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde-first",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                _fixture.Today
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde-again",
                                "tanzgarde",
                                "paula",
                                _fixture.Today
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("zeugwartin", "Zeugwartin")
                            .AddRoleHolding(
                                "paula-zeugwartin-first",
                                "zeugwartin",
                                "paula",
                                JoinedIn2017,
                                _fixture.Today
                            )
                            .AddRoleHolding(
                                "paula-zeugwartin-again",
                                "zeugwartin",
                                "paula",
                                _fixture.Today
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        var tanzgarde = Assert.Single(paula.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        var zeugwartin = Assert.Single(paula.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("zeugwartin"), zeugwartin.RoleId);
    }

    [Fact]
    public async Task Should_SortGruppenAndRollenByName_When_APersonCarriesSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("zwergengarde", "Zwergengarde")
                            .AddGroup("aeltestenrat", "Ältestenrat")
                            .AddGroupMembership(
                                "paula-zwergengarde",
                                "zwergengarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "paula-aeltestenrat",
                                "aeltestenrat",
                                "paula",
                                JoinedIn2017
                            )
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("zeugwartin", "Zeugwartin")
                            .AddRole("aemterpflege", "Ützelbützel")
                            .AddRoleHolding("paula-zeugwartin", "zeugwartin", "paula", JoinedIn2017)
                            .AddRoleHolding(
                                "paula-aemterpflege",
                                "aemterpflege",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(
            result.Members,
            member => member.PersonId == ctx.Identity.People.IdOf("paula")
        );
        Assert.Equal(
            ["Ältestenrat", "Zwergengarde"],
            paula.Groups.Select(group => group.Name).ToArray()
        );
        Assert.Equal(
            ["Ützelbützel", "Zeugwartin"],
            paula.Roles.Select(role => role.Name).ToArray()
        );
    }

    [Fact]
    public async Task Should_SortUmlautsAsGerman_When_ListingMembers()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("kuehnel", "Katrin", "Kühnel")
                        .AddMembership("kuehnel-first", "kuehnel", JoinedIn2017)
                        .AddPerson("kuhn", "Karl", "Kuhn")
                        .AddMembership("kuhn-first", "kuhn", JoinedIn2017)
                        .AddPerson("oesterreicher", "Ole", "Österreicher")
                        .AddMembership("oesterreicher-first", "oesterreicher", JoinedIn2017)
                        .AddPerson("zimmermann", "Zoe", "Zimmermann")
                        .AddMembership("zimmermann-first", "zimmermann", JoinedIn2017)
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var surnames = result
            .Members.Select(member => member.LastName)
            .Where(name => name is "Kuhn" or "Kühnel" or "Österreicher" or "Zimmermann")
            .ToArray();
        Assert.Equal(["Kuhn", "Kühnel", "Österreicher", "Zimmermann"], surnames);
    }

    [Fact]
    public async Task Should_CarryNoContactData_When_TheListIsRead()
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
                            new DateOnly(1996, 4, 3)
                        )
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(MembersRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var member = document.RootElement.GetProperty("members").EnumerateArray().First();
        var fields = member.EnumerateObject().Select(field => field.Name).ToArray();
        Assert.Equal(
            ["personId", "firstName", "lastName", "membershipState", "groups", "roles"],
            fields
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("tom")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, _) = await client.GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetMembers, GetMembersResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
