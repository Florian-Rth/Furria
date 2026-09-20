using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Core.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetGroupsTests
{
    private const string GroupsRoute = "/api/groups";
    private const int FoundedIn1971 = 1971;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetGroupsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheGruppeWithItsPeople_When_AnAffiliatedPersonReadsTheList()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                "Die Garde tanzt seit 1971.",
                                isRecruiting: true
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
        Assert.Equal("Tanzgarde", tanzgarde.Name);
        Assert.Equal("Die Garde tanzt seit 1971.", tanzgarde.Description);
        Assert.True(tanzgarde.IsRecruiting);
        Assert.Equal(1, tanzgarde.MemberCount);
        var paula = Assert.Single(tanzgarde.MemberPreview);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        Assert.Equal("Paula", paula.FirstName);
        Assert.Equal("Brendel", paula.LastName);
        var anna = Assert.Single(tanzgarde.Admins);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
        Assert.Equal("Anna", anna.FirstName);
        Assert.Equal("Kaiser", anna.LastName);
    }

    [Fact]
    public async Task Should_OmitTheGruppe_When_ItIsArchived()
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
                            .AddGroup("kindergarde", "Kindergarde", archivedOn: ArchivedIn2021)
                            .AddGroupMembership(
                                "paula-kindergarde",
                                "kindergarde",
                                "paula",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), tanzgarde.GroupId);
    }

    [Fact]
    public async Task Should_CountTheRunningRowsOnly_When_ZugehoerigkeitenAndAdminsEndedOrLieAhead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("nina", "Nina", "Orth")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("katrin", "Katrin", "Sommer")
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
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership("nina-tanzgarde", "tanzgarde", "nina", JoinsIn2030)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                            .AddGroupAdmin(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                "Trainerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(1, tanzgarde.MemberCount);
        var paula = Assert.Single(tanzgarde.MemberPreview);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        var anna = Assert.Single(tanzgarde.Admins);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
    }

    [Fact]
    public async Task Should_PreviewTheFirstFiveGermanSorted_When_TheGruppeHasMoreMembers()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ahrens", "Berta", "Ahrens")
                            .AddPerson("aetzold", "Carla", "Ätzold")
                            .AddPerson("boehme", "Doris", "Böhme")
                            .AddPerson("bohn", "Elke", "Bohn")
                            .AddPerson("loeffler", "Frieda", "Löffler")
                            .AddPerson("lohse", "Gerda", "Lohse")
                            .AddPerson("zimmermann", "Hanna", "Zimmermann")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("ahrens-tanzgarde", "tanzgarde", "ahrens")
                            .AddGroupMembership("aetzold-tanzgarde", "tanzgarde", "aetzold")
                            .AddGroupMembership("boehme-tanzgarde", "tanzgarde", "boehme")
                            .AddGroupMembership("bohn-tanzgarde", "tanzgarde", "bohn")
                            .AddGroupMembership("loeffler-tanzgarde", "tanzgarde", "loeffler")
                            .AddGroupMembership("lohse-tanzgarde", "tanzgarde", "lohse")
                            .AddGroupMembership("zimmermann-tanzgarde", "tanzgarde", "zimmermann")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(7, tanzgarde.MemberCount);
        Assert.Equal(
            ["Ahrens", "Ätzold", "Böhme", "Bohn", "Löffler"],
            tanzgarde.MemberPreview.Select(person => person.LastName)
        );
    }

    [Fact]
    public async Task Should_SortTheGruppenAsGerman_When_TheVerzeichnisIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("zwergengarde", "Zwergengarde")
                            .AddGroup("archiv", "Archiv & Chronik")
                            .AddGroup("aeltestenrat", "Ältestenrat")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ältestenrat", "Archiv & Chronik", "Zwergengarde"],
            result.Groups.Select(group => group.Name)
        );
        var aeltestenrat = result.Groups[0];
        Assert.Equal(0, aeltestenrat.MemberCount);
        Assert.Empty(aeltestenrat.MemberPreview);
        Assert.Empty(aeltestenrat.Admins);
    }

    [Fact]
    public async Task Should_CountHerOnce_When_SheLeftTodayAndRejoinedToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var today = _fixture.Today;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde-first",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                today
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde-second",
                                "tanzgarde",
                                "paula",
                                today
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017,
                                today
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                today
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.Equal(1, tanzgarde.MemberCount);
        var paula = Assert.Single(tanzgarde.MemberPreview);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        var anna = Assert.Single(tanzgarde.Admins);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
    }

    [Fact]
    public async Task Should_CarryTheSteckbrief_When_TheGruppeNamedArtJahrUndFarbe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroupKind("garden", "Garden")
                            .AddGroup(
                                "tanzgarde",
                                "Tanzgarde",
                                groupKindAlias: "garden",
                                foundedYear: FoundedIn1971,
                                tone: GroupTone.Rose
                            )
                            .AddGroup("elferrat", "Elferrat")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(GroupsRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var groups = document.RootElement.GetProperty("groups").EnumerateArray().ToList();
        var tanzgarde = groups.Single(group =>
            group.GetProperty("name").GetString() == "Tanzgarde"
        );
        var elferrat = groups.Single(group => group.GetProperty("name").GetString() == "Elferrat");
        Assert.Equal("Garden", tanzgarde.GetProperty("groupKindName").GetString());
        Assert.Equal(FoundedIn1971, tanzgarde.GetProperty("foundedYear").GetInt32());
        Assert.Equal("rose", tanzgarde.GetProperty("tone").GetString());
        Assert.Equal(JsonValueKind.Null, elferrat.GetProperty("groupKindName").ValueKind);
        Assert.Equal(JsonValueKind.Null, elferrat.GetProperty("foundedYear").ValueKind);
        Assert.Equal(JsonValueKind.Null, elferrat.GetProperty("tone").ValueKind);
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheListIsRead()
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
                            .AddGroup("tanzgarde", "Tanzgarde", "Die Garde tanzt seit 1971.")
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
        var payload = await client.GetStringAsync(GroupsRoute, ct);

        using var document = JsonDocument.Parse(payload);
        var tanzgarde = document.RootElement.GetProperty("groups").EnumerateArray().Single();
        Assert.Equal(
            [
                "groupId",
                "name",
                "description",
                "isRecruiting",
                "groupKindName",
                "foundedYear",
                "tone",
                "memberCount",
                "memberPreview",
                "admins",
                "viewerIsMember",
                "viewerIsAdmin",
            ],
            tanzgarde.EnumerateObject().Select(field => field.Name)
        );
        var paula = tanzgarde.GetProperty("memberPreview").EnumerateArray().Single();
        Assert.Equal(
            ["personId", "firstName", "lastName"],
            paula.EnumerateObject().Select(field => field.Name)
        );
    }

    [Fact]
    public async Task Should_MarkTheGruppe_When_TheViewerDancesInIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership(
                                "alice-tanzgarde",
                                "tanzgarde",
                                "alice",
                                JoinedIn2017
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = result.Groups.Single(group => group.Name == "Tanzgarde");
        var elferrat = result.Groups.Single(group => group.Name == "Elferrat");
        Assert.True(tanzgarde.ViewerIsMember);
        Assert.False(tanzgarde.ViewerIsAdmin);
        Assert.False(elferrat.ViewerIsMember);
        Assert.False(elferrat.ViewerIsAdmin);
    }

    [Fact]
    public async Task Should_MarkTheGruppe_When_TheViewerRunsItWithoutDancing()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin("alice-kindergarde", "kindergarde", "alice", "Trainerin")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var kindergarde = Assert.Single(result.Groups);
        Assert.False(kindergarde.ViewerIsMember);
        Assert.True(kindergarde.ViewerIsAdmin);
    }

    [Fact]
    public async Task Should_MarkNoStanding_When_TheViewerLeftTheGruppeAndHandedTheAdminOver()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "alice-tanzgarde",
                                "tanzgarde",
                                "alice",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "alice-tanzgarde-admin",
                                "tanzgarde",
                                "alice",
                                "Trainerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var tanzgarde = Assert.Single(result.Groups);
        Assert.False(tanzgarde.ViewerIsMember);
        Assert.False(tanzgarde.ViewerIsAdmin);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsNotAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("tom"))
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("tom", ct);
        var (response, _) = await client.GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await _fixture.CreateClient().GETAsync<GetGroups, GetGroupsResponse>();

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
