using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetGroupByIdTests
{
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly AdminSince2019 = new(2019, 1, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetGroupByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetGroupByIdResponse>> ReadGroupAsync(
        HttpClient client,
        int groupId
    ) =>
        client.GETAsync<GetGroupById, GetGroupByIdRequest, GetGroupByIdResponse>(
            new GetGroupByIdRequest { GroupId = groupId }
        );

    [Fact]
    public async Task Should_CarryTheGruppeWithItsPeople_When_AnAffiliatedPersonReadsIt()
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
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), result.GroupId);
        Assert.Equal("Tanzgarde", result.Name);
        Assert.Equal("Die Garde tanzt seit 1971.", result.Description);
        Assert.True(result.IsRecruiting);
        var paula = Assert.Single(result.Members);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        Assert.Equal("Paula", paula.FirstName);
        Assert.Equal("Brendel", paula.LastName);
        Assert.Equal(JoinedIn2017, paula.Since);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
        Assert.Equal("Anna", anna.FirstName);
        Assert.Equal("Kaiser", anna.LastName);
        Assert.Equal("Trainerin", anna.Function);
        Assert.Equal(AdminSince2019, anna.Since);
    }

    [Fact]
    public async Task Should_ReportTheChainMinimum_When_SheLeftTheGruppeAndReturned()
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
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "paula-tanzgarde-first",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "paula-tanzgarde-second",
                                "tanzgarde",
                                "paula",
                                RejoinedIn2023
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(result.Members);
        Assert.Equal(JoinedIn2017, paula.Since);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(JoinedIn2017, anna.Since);
    }

    [Fact]
    public async Task Should_CarryTheFunktionOfTheRunningRow_When_TheGruppenAdminWasRenewed()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var anna = Assert.Single(result.Admins);
        Assert.Equal("Trainerin", anna.Function);
        Assert.Equal(JoinedIn2017, anna.Since);
    }

    [Fact]
    public async Task Should_CarryNoFunktion_When_TheGruppenAdminRowNamesNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var anna = Assert.Single(result.Admins);
        Assert.Null(anna.Function);
    }

    [Fact]
    public async Task Should_OmitThem_When_TheirZugehoerigkeitEndedOrLiesAhead()
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
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(result.Members);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
    }

    [Fact]
    public async Task Should_SortMembersAndAdminsAsGerman_When_TheGruppeHasSeveral()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("bohn", "Elke", "Bohn")
                            .AddPerson("boehme", "Doris", "Böhme")
                            .AddPerson("aetzold", "Carla", "Ätzold")
                            .AddPerson("ahrens", "Berta", "Ahrens")
                            .AddPerson("zimmermann", "Hanna", "Zimmermann")
                            .AddPerson("lohse", "Gerda", "Lohse")
                            .AddPerson("loeffler", "Frieda", "Löffler")
                            .AddAccount("alice")
                            .AddMembership("alice-first", "alice", JoinedIn2017)
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bohn-tanzgarde", "tanzgarde", "bohn")
                            .AddGroupMembership("boehme-tanzgarde", "tanzgarde", "boehme")
                            .AddGroupMembership("aetzold-tanzgarde", "tanzgarde", "aetzold")
                            .AddGroupMembership("ahrens-tanzgarde", "tanzgarde", "ahrens")
                            .AddGroupAdmin("zimmermann-tanzgarde", "tanzgarde", "zimmermann")
                            .AddGroupAdmin("lohse-tanzgarde", "tanzgarde", "lohse")
                            .AddGroupAdmin("loeffler-tanzgarde", "tanzgarde", "loeffler")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ahrens", "Ätzold", "Böhme", "Bohn"],
            result.Members.Select(member => member.LastName)
        );
        Assert.Equal(
            ["Löffler", "Lohse", "Zimmermann"],
            result.Admins.Select(admin => admin.LastName)
        );
    }

    [Fact]
    public async Task Should_NameHerOnce_When_SheLeftTodayAndRejoinedToday()
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
                                "Betreuerin",
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
        var (response, result) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var paula = Assert.Single(result.Members);
        Assert.Equal(JoinedIn2017, paula.Since);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(JoinedIn2017, anna.Since);
        Assert.Equal("Trainerin", anna.Function);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeIsArchived()
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
        var (response, _) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeDoesNotExist()
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
        var (response, _) = await ReadGroupAsync(client, UnknownGroupId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheGruppeIsRead()
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
                            .AddGroup("tanzgarde", "Tanzgarde", "Die Garde tanzt seit 1971.")
                            .AddGroupMembership(
                                "paula-tanzgarde",
                                "tanzgarde",
                                "paula",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var payload = await client.GetStringAsync(
            $"/api/groups/{ctx.Groups.Groups.IdOf("tanzgarde")}",
            ct
        );

        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            ["groupId", "name", "description", "isRecruiting", "members", "admins"],
            document.RootElement.EnumerateObject().Select(field => field.Name)
        );
        var paula = document.RootElement.GetProperty("members").EnumerateArray().Single();
        Assert.Equal(
            ["personId", "firstName", "lastName", "since"],
            paula.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal("2017-09-01", paula.GetProperty("since").GetString());
        var anna = document.RootElement.GetProperty("admins").EnumerateArray().Single();
        Assert.Equal(
            ["personId", "firstName", "lastName", "function", "since"],
            anna.EnumerateObject().Select(field => field.Name)
        );
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
        var (response, _) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyAdministersTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("trainerin"))
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "trainerin-kindergarde",
                                "kindergarde",
                                "trainerin",
                                "Trainerin"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("trainerin", ct);
        var (response, _) = await ReadGroupAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await ReadGroupAsync(
            _fixture.CreateClient(),
            ctx.Groups.Groups.IdOf("tanzgarde")
        );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_TheGroupIdIsNotPositive()
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
        var (response, _) = await ReadGroupAsync(client, 0);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
