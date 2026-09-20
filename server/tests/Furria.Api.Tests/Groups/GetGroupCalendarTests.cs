using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class GetGroupCalendarTests
{
    private const string GardeTraining = "Training der Tanzgarde";
    private const string Prunksitzung = "Prunksitzung";
    private const string KinderProbe = "Probe der Kindergarde";
    private const string Umzug = "Rosenmontagsumzug";
    private const int UnknownGroupId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly WindowStart = new(2027, 1, 1);
    private static readonly DateOnly WindowEnd = new(2027, 3, 1);
    private static readonly DateOnly TheTrainingDay = new(2027, 1, 18);

    private static readonly DateTimeOffset AtTheTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtThePrunksitzung = new(
        2027,
        2,
        6,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheKinderProbe = new(
        2027,
        1,
        22,
        16,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheUmzug = new(2027, 2, 10, 11, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetGroupCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryTheEigenenUndDieMitwirkenden_When_TheCallerIsInTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.Equal(new[] { GardeTraining, Prunksitzung }, TitlesOf(result));
    }

    [Fact]
    public async Task Should_CarryTheKalender_When_TheCallerOnlyAdministersTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(ctx, "chris", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.Equal(new[] { GardeTraining, Prunksitzung }, TitlesOf(result));
    }

    [Fact]
    public async Task Should_CarryTheKalender_When_TheCallerHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(ctx, "ilka", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.Contains(Prunksitzung, TitlesOf(result));
    }

    [Fact]
    public async Task Should_LeaveOutTheFremdenGruppeninternenEintrag_When_TheGruppeOnlyMitwirkt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.DoesNotContain(KinderProbe, TitlesOf(result));
    }

    [Fact]
    public async Task Should_LeaveOutTheVereinsEintrag_When_DieGruppeNichtMitwirkt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        Assert.DoesNotContain(Umzug, TitlesOf(result));
    }

    [Fact]
    public async Task Should_NameTheMitwirkendeGruppe_When_TheEintragCarriesOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(ctx, "bea", Window(ctx.Groups.Groups.IdOf("tanzgarde")), ct);

        var prunksitzung = result.Entries.Single(entry => entry.Title == Prunksitzung);
        var participant = Assert.Single(prunksitzung.ParticipatingGroups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), participant.GroupId);
        Assert.Equal("Tanzgarde", participant.Name);
    }

    [Fact]
    public async Task Should_NarrowTheFenster_When_AWindowIsGiven()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var result = await ReadAsync(
            ctx,
            "bea",
            new GetGroupCalendarRequest
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                From = TheTrainingDay,
                To = TheTrainingDay,
            },
            ct
        );

        Assert.Equal(new[] { GardeTraining }, TitlesOf(result));
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerIsOnlyAffiliated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var client = await ctx.Identity.ClientForAsync("alice", ct);
        var (response, _) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(Window(ctx.Groups.Groups.IdOf("tanzgarde")));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheGruppeIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, _) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(Window(UnknownGroupId));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_RejectTheRequest_When_TheWindowEndsBeforeItStarts()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildKalenderAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, _) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(
            new GetGroupCalendarRequest
            {
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                From = WindowEnd,
                To = WindowStart,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetGroupCalendar, GetGroupCalendarRequest, GetGroupCalendarResponse>(
                Window(UnknownGroupId)
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static GetGroupCalendarRequest Window(int groupId) =>
        new()
        {
            GroupId = groupId,
            From = WindowStart,
            To = WindowEnd,
        };

    private static string[] TitlesOf(GetGroupCalendarResponse result) =>
        [.. result.Entries.Select(entry => entry.Title)];

    private static async Task<GetGroupCalendarResponse> ReadAsync(
        SeededContext ctx,
        string alias,
        GetGroupCalendarRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.GETAsync<
            GetGroupCalendar,
            GetGroupCalendarRequest,
            GetGroupCalendarResponse
        >(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

    private static void WholeClub(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("alice", "Alice", "Muster")
            .AddAccount("alice")
            .AddMembership("alice-first", "alice", JoinedIn2017)
            .AddPerson("bea", "Bea", "Garde")
            .AddAccount("bea")
            .AddMembership("bea-first", "bea", JoinedIn2017)
            .AddPerson("chris", "Chris", "Trainer")
            .AddAccount("chris")
            .AddMembership("chris-first", "chris", JoinedIn2017)
            .AddPerson("ilka", "Ilka", "Gruppenpflege")
            .AddAccount("ilka")
            .AddMembership("ilka-first", "ilka", JoinedIn2017);

    private Task<SeededContext> BuildKalenderAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "ilka-gruppenpflege",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddCalendarEntry(
                                "garde-training",
                                GardeTraining,
                                AtTheTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "kinder-probe",
                                KinderProbe,
                                AtTheKinderProbe,
                                kind: CalendarEntryKind.Rehearsal,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "kindergarde",
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "prunksitzung",
                                Prunksitzung,
                                AtThePrunksitzung,
                                participatingGroupAliases: ["tanzgarde"]
                            )
                            .AddCalendarEntry(
                                "umzug",
                                Umzug,
                                AtTheUmzug,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Public
                            )
                    ),
            ct
        );
}
