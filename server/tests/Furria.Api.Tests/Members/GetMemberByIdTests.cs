using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Members;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Core.Club;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Members;

[Collection("Api")]
public sealed class GetMemberByIdTests
{
    private const int UnknownPersonId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetMemberByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetMemberByIdResponse>> ReadCardAsync(
        HttpClient client,
        int personId
    ) =>
        client.GETAsync<GetMemberById, GetMemberByIdRequest, GetMemberByIdResponse>(
            new GetMemberByIdRequest { PersonId = personId }
        );

    [Fact]
    public async Task Should_ReturnHerCard_When_AnAffiliatedPersonIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddMembership("paula-first", "paula", JoinedIn2017)
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
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("zeugwartin", "Zeugwartin")
                            .AddRoleHolding("paula-zeugwartin", "zeugwartin", "paula", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), result.PersonId);
        Assert.Equal("Paula", result.FirstName);
        Assert.Equal("Brendel", result.LastName);
        Assert.Equal(MembershipState.Active, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.Equal(JoinedIn2017, tanzgarde.Since);
        var equipmentWarden = Assert.Single(result.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("zeugwartin"), equipmentWarden.RoleId);
        Assert.Equal("Zeugwartin", equipmentWarden.Name);
        Assert.Equal(JoinedIn2017, equipmentWarden.Since);
        Assert.Equal(ContactVisibility.Hidden, result.Contact.Visibility);
    }

    [Fact]
    public async Task Should_ShowTheContactData_When_TheTargetOptedIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact(
                            "paula",
                            "paula@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra",
                            contactVisibleToMembers: true
                        )
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.Shared, result.Contact.Visibility);
        Assert.Equal("0170 1234567", result.Contact.Phone);
        Assert.Equal("paula@example.test", result.Contact.Email);
        Assert.Equal("Hauptstraße 12", result.Contact.Street);
        Assert.Equal("99713", result.Contact.Zip);
        Assert.Equal("Großfurra", result.Contact.City);
    }

    [Fact]
    public async Task Should_WithholdEveryField_When_TheTargetDidNotOptInAndTheViewerHoldsNoKey()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact(
                            "paula",
                            "paula@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra"
                        )
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.Hidden, result.Contact.Visibility);
        Assert.Null(result.Contact.Phone);
        Assert.Null(result.Contact.Email);
        Assert.Null(result.Contact.Street);
        Assert.Null(result.Contact.Zip);
        Assert.Null(result.Contact.City);
    }

    [Fact]
    public async Task Should_RevealTheContactData_When_TheViewerHoldsPersonsReadDetails()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPersonContact(
                                "paula",
                                "paula@example.test",
                                "0170 1234567",
                                "Hauptstraße 12",
                                "99713",
                                "Großfurra"
                            )
                            .AddMembership("paula-first", "paula", JoinedIn2017)
                            .AddPerson("katrin", "Katrin", "Kühnel")
                            .AddAccount("katrin")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "mitgliederpflege",
                            "katrin-mitgliederpflege",
                            "Mitgliederpflege",
                            "katrin",
                            FurriaPermissions.PersonsReadDetails
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("katrin", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));
        var payload = await client.GetStringAsync(
            $"/api/members/{ctx.Identity.People.IdOf("paula")}",
            ct
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.RevealedByPermission, result.Contact.Visibility);
        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            "revealedByPermission",
            document.RootElement.GetProperty("contact").GetProperty("visibility").GetString()
        );
        Assert.Equal("0170 1234567", result.Contact.Phone);
        Assert.Equal("paula@example.test", result.Contact.Email);
        Assert.Equal("Hauptstraße 12", result.Contact.Street);
        Assert.Equal("99713", result.Contact.Zip);
        Assert.Equal("Großfurra", result.Contact.City);
    }

    [Fact]
    public async Task Should_ReportTheChainMinimum_When_SheLeftAndRejoinedTheGroupAndTheRole()
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
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde-again",
                                "tanzgarde",
                                "paula",
                                RejoinedIn2023
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
                                LeftIn2020
                            )
                            .AddRoleHolding(
                                "paula-zeugwartin-again",
                                "zeugwartin",
                                "paula",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(JoinedIn2017, tanzgarde.Since);
        var equipmentWarden = Assert.Single(result.Roles);
        Assert.Equal(JoinedIn2017, equipmentWarden.Since);
    }

    [Fact]
    public async Task Should_OmitTheTie_When_ItEndedOrItsGroupOrRoleIsArchived()
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
                                ArchivedIn2021
                            )
                            .AddRoleHolding(
                                "paula-schriftfuehrung",
                                "schriftfuehrung",
                                "paula",
                                JoinedIn2017
                            )
                            .AddRole("zeugwartin", "Zeugwartin")
                            .AddRoleHolding("paula-zeugwartin", "zeugwartin", "paula", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var marschmusik = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("marschmusik"), marschmusik.GroupId);
        var equipmentWarden = Assert.Single(result.Roles);
        Assert.Equal(ctx.Roles.Roles.IdOf("zeugwartin"), equipmentWarden.RoleId);
    }

    [Fact]
    public async Task Should_NameEachGroupAndRoleOnce_When_ATieEndedAndANewOneStartedToday()
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

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(JoinedIn2017, tanzgarde.Since);
        var equipmentWarden = Assert.Single(result.Roles);
        Assert.Equal(JoinedIn2017, equipmentWarden.Since);
    }

    [Fact]
    public async Task Should_SortGroupsAndRolesAsGerman_When_SheCarriesSeveral()
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
                            .AddGroup("archiv", "Archiv")
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
                            .AddGroupMembership("paula-archiv", "archiv", "paula", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles
                            .AddRole("zeugwartin", "Zeugwartin")
                            .AddRole("uetzelbuetzel", "Ützelbützel")
                            .AddRole("umzugsleitung", "Umzugsleitung")
                            .AddRoleHolding("paula-zeugwartin", "zeugwartin", "paula", JoinedIn2017)
                            .AddRoleHolding(
                                "paula-uetzelbuetzel",
                                "uetzelbuetzel",
                                "paula",
                                JoinedIn2017
                            )
                            .AddRoleHolding(
                                "paula-umzugsleitung",
                                "umzugsleitung",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ältestenrat", "Archiv", "Zwergengarde"],
            result.Groups.Select(group => group.Name).ToArray()
        );
        Assert.Equal(
            ["Umzugsleitung", "Ützelbützel", "Zeugwartin"],
            result.Roles.Select(role => role.Name).ToArray()
        );
    }

    [Fact]
    public async Task Should_KeepTheFirstStartDate_When_SheQuitAndRejoinedTheClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddAccount("paula")
                        .AddMembership("paula-first", "paula", JoinedIn2017, LeftIn2020)
                        .AddMembership("paula-again", "paula", RejoinedIn2023)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Active, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_ReportEndedAndKeepHerCard_When_AFormerMemberStillDances()
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

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Ended, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_ReportNoMembership_When_SheOnlyBelongsToAGroup()
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

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.None, result.MembershipState);
        Assert.Null(result.MemberSince);
    }

    [Fact]
    public async Task Should_ReportPaused_When_TheRunningMembershipPausesThisSession()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddAccount("paula")
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddMembershipPause(
                            "paula-ruhezeit",
                            "paula-first",
                            _fixture.CurrentSessionYear
                        )
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(MembershipState.Paused, result.MembershipState);
        Assert.Equal(JoinedIn2017, result.MemberSince);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonDoesNotExist()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, _) = await ReadCardAsync(client, UnknownPersonId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ThePersonIsNoLongerAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("frank", "Frank", "Ehemalig")
                            .AddMembership("frank-first", "frank", JoinedIn2017, LeftIn2020)
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "showtanz",
                                "Showtanz",
                                "Aufgeloest.",
                                isRecruiting: false,
                                ArchivedIn2021
                            )
                            .AddGroupMembership("frank-showtanz", "showtanz", "frank", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, _) = await ReadCardAsync(client, ctx.Identity.People.IdOf("frank"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryNoBirthDate_When_TheCardIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact(
                            "paula",
                            "paula@example.test",
                            "0170 1234567",
                            "Hauptstraße 12",
                            "99713",
                            "Großfurra",
                            contactVisibleToMembers: true,
                            new DateOnly(1996, 4, 3)
                        )
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddAccount("alice")
                        .AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(
            $"/api/members/{ctx.Identity.People.IdOf("paula")}",
            ct
        );

        using var document = JsonDocument.Parse(payload);
        var fields = document.RootElement.EnumerateObject().Select(field => field.Name).ToArray();
        Assert.Equal(
            [
                "personId",
                "firstName",
                "lastName",
                "membershipState",
                "memberSince",
                "groups",
                "roles",
                "contact",
            ],
            fields
        );
        var contactFields = document
            .RootElement.GetProperty("contact")
            .EnumerateObject()
            .Select(field => field.Name)
            .ToArray();
        Assert.Equal(["visibility", "phone", "email", "street", "zip", "city"], contactFields);
        Assert.Equal(
            "shared",
            document.RootElement.GetProperty("contact").GetProperty("visibility").GetString()
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                        .AddAccount("tom")
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);

        var (response, _) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                ),
            ct
        );

        var (response, _) = await ReadCardAsync(
            _fixture.CreateClient(),
            ctx.Identity.People.IdOf("paula")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ThePersonIdIsNotPositive()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity.AddAccount("alice").AddMembership("alice-first", "alice", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);

        var (response, _) = await ReadCardAsync(client, 0);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_WithholdHerOwnContactData_When_SheReadsHerOwnCardWithoutOptingIn()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder.Identity(identity =>
                    identity
                        .AddPerson("paula", "Paula", "Brendel")
                        .AddPersonContact("paula", "paula@example.test", "0170 1234567")
                        .AddAccount("paula")
                        .AddMembership("paula-first", "paula", JoinedIn2017)
                ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);

        var (response, result) = await ReadCardAsync(client, ctx.Identity.People.IdOf("paula"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ContactVisibility.Hidden, result.Contact.Visibility);
        Assert.Null(result.Contact.Phone);
        Assert.Null(result.Contact.Email);
    }
}
