using System.Net;
using System.Text.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetMyGroupByIdTests
{
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly AdminSince2019 = new(2019, 1, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly EndedIn2024 = new(2024, 3, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetMyGroupByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetMyGroupByIdResponse>> ReadHubAsync(
        HttpClient client,
        int groupId
    ) =>
        client.GETAsync<GetMyGroupById, GetMyGroupByIdRequest, GetMyGroupByIdResponse>(
            new GetMyGroupByIdRequest { GroupId = groupId }
        );

    [Fact]
    public async Task Should_CarryTheRunningRows_When_AMemberReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
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

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), result.GroupId);
        Assert.Equal("Tanzgarde", result.Name);
        Assert.Equal("Die Garde tanzt seit 1971.", result.Description);
        Assert.True(result.IsRecruiting);
        Assert.False(result.ViewerIsAdmin);
        var paula = Assert.Single(result.Members);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"), paula.GroupMembershipId);
        Assert.Equal(ctx.Identity.People.IdOf("paula"), paula.PersonId);
        Assert.Equal("Paula", paula.FirstName);
        Assert.Equal("Brendel", paula.LastName);
        Assert.Equal(JoinedIn2017, paula.JoinedOn);
        Assert.Null(paula.LeftOn);
        Assert.Equal(JoinedIn2017, paula.Since);
        var anna = Assert.Single(result.Admins);
        Assert.Equal(ctx.Groups.GroupAdmins.IdOf("anna-tanzgarde"), anna.GroupAdminId);
        Assert.Equal(ctx.Identity.People.IdOf("anna"), anna.PersonId);
        Assert.Equal("Anna", anna.FirstName);
        Assert.Equal("Kaiser", anna.LastName);
        Assert.Equal("Trainerin", anna.Function);
        Assert.Equal(AdminSince2019, anna.SinceOn);
        Assert.Null(anna.UntilOn);
        Assert.Equal(AdminSince2019, anna.Since);
    }

    [Fact]
    public async Task Should_CarryTheHistory_When_TheGruppenAdminReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddAccount("anna")
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
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                            .AddGroupAdmin(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
        Assert.Equal(
            [ctx.Identity.People.IdOf("paula")],
            result.Members.Select(member => member.PersonId)
        );
        Assert.Equal(
            [ctx.Identity.People.IdOf("anna")],
            result.Admins.Select(admin => admin.PersonId)
        );
        var mara = Assert.Single(result.PastMembers);
        Assert.Equal(ctx.Groups.GroupMemberships.IdOf("mara-tanzgarde"), mara.GroupMembershipId);
        Assert.Equal(ctx.Identity.People.IdOf("mara"), mara.PersonId);
        Assert.Equal("Mara", mara.FirstName);
        Assert.Equal("Lenz", mara.LastName);
        Assert.Equal(JoinedIn2017, mara.JoinedOn);
        Assert.Equal(LeftIn2020, mara.LeftOn);
        Assert.Equal(JoinedIn2017, mara.Since);
        var katrin = Assert.Single(result.PastAdmins);
        Assert.Equal(ctx.Groups.GroupAdmins.IdOf("katrin-tanzgarde"), katrin.GroupAdminId);
        Assert.Equal(ctx.Identity.People.IdOf("katrin"), katrin.PersonId);
        Assert.Equal("Betreuerin", katrin.Function);
        Assert.Equal(JoinedIn2017, katrin.SinceOn);
        Assert.Equal(LeftIn2020, katrin.UntilOn);
        Assert.Equal(JoinedIn2017, katrin.Since);
    }

    [Fact]
    public async Task Should_WithholdTheHistory_When_APlainMemberReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddAccount("paula")
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
                            .AddGroupAdmin(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(result.ViewerIsAdmin);
        Assert.Empty(result.PastMembers);
        Assert.Empty(result.PastAdmins);
    }

    [Fact]
    public async Task Should_ReportTheChainMinimum_When_SheLeftTheGruppeAndReturned()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("anna", "Anna", "Kaiser").AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "anna-tanzgarde-first",
                                "tanzgarde",
                                "anna",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "anna-tanzgarde-second",
                                "tanzgarde",
                                "anna",
                                RejoinedIn2023
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-admin-first",
                                "tanzgarde",
                                "anna",
                                "Betreuerin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupAdmin(
                                "anna-tanzgarde-admin-second",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                RejoinedIn2023
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var running = Assert.Single(result.Members);
        Assert.Equal(RejoinedIn2023, running.JoinedOn);
        Assert.Equal(JoinedIn2017, running.Since);
        var ended = Assert.Single(result.PastMembers);
        Assert.Equal(JoinedIn2017, ended.JoinedOn);
        Assert.Equal(LeftIn2020, ended.LeftOn);
        Assert.Equal(JoinedIn2017, ended.Since);
        var runningAdmin = Assert.Single(result.Admins);
        Assert.Equal(RejoinedIn2023, runningAdmin.SinceOn);
        Assert.Equal(JoinedIn2017, runningAdmin.Since);
        Assert.Equal("Trainerin", runningAdmin.Function);
        var endedAdmin = Assert.Single(result.PastAdmins);
        Assert.Equal(JoinedIn2017, endedAdmin.SinceOn);
        Assert.Equal(JoinedIn2017, endedAdmin.Since);
    }

    [Fact]
    public async Task Should_OmitTheRow_When_ItLiesAhead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("nina", "Nina", "Orth")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                            .AddGroupMembership("nina-tanzgarde", "tanzgarde", "nina", JoinsIn2030)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
        Assert.Empty(result.Members);
        Assert.Empty(result.PastMembers);
    }

    [Fact]
    public async Task Should_ListTheHistoryNewestFirst_When_TheGruppenAdminReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                JoinedIn2017
                            )
                            .AddGroupMembership(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                RejoinedIn2023,
                                EndedIn2024
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            [
                ctx.Groups.GroupMemberships.IdOf("mara-tanzgarde"),
                ctx.Groups.GroupMemberships.IdOf("katrin-tanzgarde"),
            ],
            result.PastMembers.Select(member => member.GroupMembershipId)
        );
    }

    [Fact]
    public async Task Should_SortTheRunningRowsAsGerman_When_TheGruppeHasSeveral()
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
                            .AddAccount("ahrens")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("bohn-tanzgarde", "tanzgarde", "bohn")
                            .AddGroupMembership("boehme-tanzgarde", "tanzgarde", "boehme")
                            .AddGroupMembership("aetzold-tanzgarde", "tanzgarde", "aetzold")
                            .AddGroupMembership("ahrens-tanzgarde", "tanzgarde", "ahrens")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ahrens", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(
            ["Ahrens", "Ätzold", "Böhme", "Bohn"],
            result.Members.Select(member => member.LastName)
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerBelongsToAnotherGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mara"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("elferrat", "Elferrat")
                            .AddGroupMembership("mara-elferrat", "elferrat", "mara", JoinedIn2017)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_HerZugehoerigkeitHasEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("mara"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership(
                                "mara-tanzgarde",
                                "tanzgarde",
                                "mara",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity.AddPerson("ilka", "Ilka", "Reineke").AddAccount("ilka")
                    )
                    .Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde"))
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("paula"))
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

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheGruppeDoesNotExist()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("paula")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await ReadHubAsync(client, UnknownGroupId);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerIsNotAuthenticated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Groups(groups => groups.AddGroup("tanzgarde", "Tanzgarde")),
            ct
        );

        var (response, _) = await ReadHubAsync(
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
            builder => builder.Identity(identity => identity.AddAccount("paula")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("paula", ct);
        var (response, _) = await ReadHubAsync(client, 0);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_CarryExactlyTheContractFields_When_TheHubIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde", "Die Garde tanzt seit 1971.")
                            .AddGroupAdmin(
                                "anna-tanzgarde",
                                "tanzgarde",
                                "anna",
                                "Trainerin",
                                AdminSince2019
                            )
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara", JoinedIn2017)
                            .AddGroupMembership(
                                "katrin-tanzgarde",
                                "tanzgarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var payload = await client.GetStringAsync(
            $"/api/my-groups/{ctx.Groups.Groups.IdOf("tanzgarde")}",
            ct
        );

        using var document = JsonDocument.Parse(payload);
        Assert.Equal(
            [
                "groupId",
                "name",
                "description",
                "isRecruiting",
                "viewerIsAdmin",
                "members",
                "admins",
                "pastMembers",
                "pastAdmins",
            ],
            document.RootElement.EnumerateObject().Select(field => field.Name)
        );
        var mara = document.RootElement.GetProperty("members").EnumerateArray().Single();
        Assert.Equal(
            [
                "groupMembershipId",
                "personId",
                "firstName",
                "lastName",
                "joinedOn",
                "leftOn",
                "since",
            ],
            mara.EnumerateObject().Select(field => field.Name)
        );
        Assert.Equal("2017-09-01", mara.GetProperty("joinedOn").GetString());
        Assert.Equal(JsonValueKind.Null, mara.GetProperty("leftOn").ValueKind);
        var anna = document.RootElement.GetProperty("admins").EnumerateArray().Single();
        Assert.Equal(
            [
                "groupAdminId",
                "personId",
                "firstName",
                "lastName",
                "function",
                "sinceOn",
                "untilOn",
                "since",
            ],
            anna.EnumerateObject().Select(field => field.Name)
        );
        var katrin = document.RootElement.GetProperty("pastMembers").EnumerateArray().Single();
        Assert.Equal("2020-03-01", katrin.GetProperty("leftOn").GetString());
        Assert.Empty(document.RootElement.GetProperty("pastAdmins").EnumerateArray());
    }
}
