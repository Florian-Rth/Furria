using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

[Collection("Api")]
public sealed class GetCalendarTests
{
    private const string Vereinssitzung = "Vereinssitzung";
    private const string Umzug = "Rosenmontagsumzug";
    private const string GardeTraining = "Training der Tanzgarde";
    private const string GardeAuftritt = "Auftritt der Tanzgarde";
    private const string GardeFeier = "Gardefeier";
    private const string KinderTraining = "Training der Kindergarde";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheGardeTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheGardeAuftritt = new(
        2027,
        1,
        19,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheSitzung = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheGardeFeier = new(
        2027,
        1,
        21,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheKinderTraining = new(
        2027,
        1,
        22,
        16,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheUmzug = new(2027, 2, 10, 11, 0, 0, TimeSpan.Zero);

    private static readonly DateOnly TheAuftrittDay = new(2027, 1, 19);
    private static readonly DateOnly TheSitzungDay = new(2027, 1, 20);

    private readonly ApiTestFixture _fixture;

    public GetCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryNoEintrag_When_TheKalenderIsEmpty()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(builder => builder.Identity(WholeClub), ct);

                var result = await ReadAsync(ctx, "alice", new GetCalendarRequest(), ct);

                Assert.Empty(result.Entries);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAGruppeninternenEintrag_When_TheCallerIsNotInThatGruppe()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(ctx, "alice", new GetCalendarRequest(), ct);

                Assert.Equal(
                    new[] { GardeAuftritt, Vereinssitzung, GardeFeier, Umzug },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheGruppeninternenEintrag_When_TheCallerBelongsToTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(ctx, "bea", new GetCalendarRequest(), ct);

                Assert.Equal(
                    new[] { GardeTraining, GardeAuftritt, Vereinssitzung, GardeFeier, Umzug },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheGruppeninternenEintrag_When_TheCallerAdministersTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(ctx, "chris", new GetCalendarRequest(), ct);

                Assert.Contains(GardeTraining, TitlesOf(result));
                Assert.DoesNotContain(KinderTraining, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_CarryOnlyVereinsEintraege_When_TheScopeIsVerein()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    new GetCalendarRequest { Scope = CalendarScope.Club },
                    ct
                );

                Assert.Equal(new[] { Vereinssitzung, Umzug }, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_CarryOnlyThatGruppesEintraege_When_TheScopeIsGruppe()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    new GetCalendarRequest
                    {
                        Scope = CalendarScope.Group,
                        GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                    },
                    ct
                );

                Assert.Equal(new[] { GardeTraining, GardeAuftritt, GardeFeier }, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_RejectTheRequest_When_TheGruppenScopeNamesNoGruppe()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var (response, _) = await client.GETAsync<
                    GetCalendar,
                    GetCalendarRequest,
                    GetCalendarResponse
                >(new GetCalendarRequest { Scope = CalendarScope.Group });

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_LeaveOutAnEintragOutsideTheWindow_When_TheWindowIsNarrowed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "alice",
                    new GetCalendarRequest { From = TheAuftrittDay, To = TheSitzungDay },
                    ct
                );

                Assert.Equal(new[] { GardeAuftritt, Vereinssitzung }, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_RejectTheRequest_When_TheWindowEndsBeforeItStarts()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var (response, _) = await client.GETAsync<
                    GetCalendar,
                    GetCalendarRequest,
                    GetCalendarResponse
                >(new GetCalendarRequest { From = TheSitzungDay, To = TheAuftrittDay });

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_RejectTheRequest_When_TheWindowIsLongerThanAllowed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var (response, _) = await client.GETAsync<
                    GetCalendar,
                    GetCalendarRequest,
                    GetCalendarResponse
                >(
                    new GetCalendarRequest
                    {
                        From = TheAuftrittDay,
                        To = TheAuftrittDay.AddDays(401),
                    }
                );

                Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheViewersAnswer_When_SheHasAlreadyAnswered()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    new GetCalendarRequest { Scope = CalendarScope.Club },
                    ct
                );

                var sitzung = result.Entries.Single(entry => entry.Title == Vereinssitzung);
                Assert.True(sitzung.AsksForResponse);
                Assert.Equal(AttendanceAnswer.Yes, sitzung.ViewerAnswer);

                var umzug = result.Entries.Single(entry => entry.Title == Umzug);
                Assert.Null(umzug.ViewerAnswer);
            }
        );
    }

    [Fact]
    public async Task Should_NameTheOrtAndDieGruppe_When_TheEintragCarriesThem()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildKalenderAsync(ct);

                var result = await ReadAsync(ctx, "bea", new GetCalendarRequest(), ct);

                var training = result.Entries.Single(entry => entry.Title == GardeTraining);
                Assert.Equal("Bühnenhaus", training.VenueName);
                Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), training.OwnerGroupId);
                Assert.Equal("Tanzgarde", training.OwnerGroupName);
                Assert.Equal(CalendarEntryKind.Training, training.Kind);
                Assert.Equal(CalendarEntryVisibility.Group, training.Visibility);

                var umzug = result.Entries.Single(entry => entry.Title == Umzug);
                Assert.Null(umzug.VenueName);
                Assert.Null(umzug.OwnerGroupId);
                Assert.Null(umzug.OwnerGroupName);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoRunningMitgliedschaft()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("gast")),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("gast", ct);
        var (response, _) = await client.GETAsync<
            GetCalendar,
            GetCalendarRequest,
            GetCalendarResponse
        >(new GetCalendarRequest());

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .GETAsync<GetCalendar, GetCalendarRequest, GetCalendarResponse>(
                new GetCalendarRequest()
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static string[] TitlesOf(GetCalendarResponse result) =>
        [.. result.Entries.Select(entry => entry.Title)];

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
            .AddMembership("chris-first", "chris", JoinedIn2017);

    private Task<SeededContext> BuildKalenderAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(WholeClub)
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
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddCalendarEntry(
                                "garde-training",
                                GardeTraining,
                                AtTheGardeTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                venueAlias: "buehnenhaus",
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-auftritt",
                                GardeAuftritt,
                                AtTheGardeAuftritt,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Club,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-feier",
                                GardeFeier,
                                AtTheGardeFeier,
                                kind: CalendarEntryKind.Party,
                                visibility: CalendarEntryVisibility.Public,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "kinder-training",
                                KinderTraining,
                                AtTheKinderTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                ownerGroupAlias: "kindergarde"
                            )
                            .AddCalendarEntry(
                                "vereinssitzung",
                                Vereinssitzung,
                                AtTheSitzung,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "umzug",
                                Umzug,
                                AtTheUmzug,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Public
                            )
                            .AddAttendanceResponse(
                                "bea-sagt-zu",
                                "vereinssitzung",
                                "bea",
                                AttendanceAnswer.Yes
                            )
                    ),
            ct
        );

    private static async Task<GetCalendarResponse> ReadAsync(
        SeededContext ctx,
        string alias,
        GetCalendarRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.GETAsync<
            GetCalendar,
            GetCalendarRequest,
            GetCalendarResponse
        >(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }
}
