using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Api.Tests.Media;
using Furria.Core.GroupMatcher;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

public sealed class GetGroupByIdTests : IClassFixture<ApiTestFixture>
{
    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly LeftIn2020 = new(2020, 3, 1);
    private static readonly DateOnly ArchivedIn2021 = new(2021, 1, 1);
    private static readonly DateOnly RejoinedIn2023 = new(2023, 9, 1);
    private static readonly DateOnly JoinsIn2030 = new(2030, 1, 1);

    private readonly ApiTestFixture _fixture;

    public GetGroupByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    private static Task<TestResult<GetGroupByIdResponse>> ReadHubAsync(
        HttpClient client,
        int groupId
    ) =>
        client.GETAsync<GetGroupById, GetGroupByIdRequest, GetGroupByIdResponse>(
            new GetGroupByIdRequest { GroupId = groupId }
        );

    [Fact]
    public async Task Should_CountOpenAndChangedStatements_When_TheGroupAdminReadsHerHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = _fixture.TimeProvider.GetUtcNow();
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    )
                    .GroupMatcher(matcher =>
                        matcher
                            .AddStatement("beantwortet", "Konfetti ist Pflicht.")
                            .AddStatement(
                                "umformuliert",
                                "Bierbänke stelle ich auf.",
                                rewordedAt: now
                            )
                            .AddStatement("offen", "Orden sind schwer.")
                            .AddStance("tanzgarde", "beantwortet", StancePosition.Yes)
                            .AddStance("tanzgarde", "umformuliert", StancePosition.No)
                            .AddTakingPart("tanzgarde")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(result.GroupMatcher);
        Assert.True(result.GroupMatcher.IsTakingPart);
        Assert.Equal(2, result.GroupMatcher.OpenStatements);
    }

    [Fact]
    public async Task Should_ReportHerChainMinimum_When_SheLeftTheGroupAndReturned()
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
        Assert.Equal(JoinedIn2017, result.ViewerSince);
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
    public async Task Should_ReturnTheHub_When_TheCallerOnlyAdministersTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("trainerin", "Tanja", "Weber")
                            .AddPerson("katrin", "Katrin", "Sommer")
                            .AddAccount("trainerin")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupAdmin(
                                "trainerin-kindergarde",
                                "kindergarde",
                                "trainerin",
                                "Trainerin"
                            )
                            .AddGroupMembership(
                                "katrin-kindergarde",
                                "kindergarde",
                                "katrin",
                                JoinedIn2017,
                                LeftIn2020
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("trainerin", ct);
        var (response, result) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.True(result.ViewerIsAdmin);
        Assert.True(result.ViewerMayManage);
        Assert.False(result.ViewerIsMember);
        Assert.Null(result.ViewerSince);
        Assert.Equal(
            [ctx.Identity.People.IdOf("katrin")],
            result.PastMembers.Select(member => member.PersonId)
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
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("tanzgarde"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_HerGroupMembershipHasEnded()
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
    public async Task Should_ReturnNotFound_When_TheGroupIsArchived()
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
        var (response, _) = await ReadHubAsync(client, ctx.Groups.Groups.IdOf("kindergarde"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Should_ShowThePictureAndPortraitsButNoCutting_When_AMemberOpensTheHub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await GardeWithPicturesAsync(ct);

        var (_, result) = await ReadHubAsync(
            await ctx.Identity.ClientForAsync("mara", ct),
            ctx.Groups.Groups.IdOf("tanzgarde")
        );

        Assert.NotNull(result.Picture);
        Assert.Null(result.PictureEditing);
        Assert.NotNull(Assert.Single(result.Admins).Portrait);
        Assert.Null(Assert.Single(result.Members).Portrait);
    }

    private async Task<SeededContext> GardeWithPicturesAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddAccount("anna").AddAccount("mara"))
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara", JoinedIn2017)
                    ),
            ct
        );
        var anna = await ctx.Identity.ClientForAsync("anna", ct);
        await PictureSteps.RenderedGroupPictureAsync(
            _fixture,
            anna,
            ctx.Groups.Groups.IdOf("tanzgarde"),
            ct
        );
        await PictureSteps.RenderedPortraitAsync(
            _fixture,
            anna,
            ctx.Identity.People.IdOf("anna"),
            ct
        );
        return ctx;
    }
}
