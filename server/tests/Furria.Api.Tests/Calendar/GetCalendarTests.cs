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
    private const string ClubMeeting = "Vereinssitzung";
    private const string Parade = "Rosenmontagsumzug";
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const string DanceGuardPerformance = "Auftritt der Tanzgarde";
    private const string DanceGuardParty = "Gardefeier";
    private const string KinderTraining = "Training der Kindergarde";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

    private static readonly DateTimeOffset Now = new(2027, 1, 15, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheDanceGuardTraining = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheDanceGuardPerformance = new(
        2027,
        1,
        19,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheMeeting = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheDanceGuardParty = new(
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
    private static readonly DateTimeOffset AtTheParade = new(2027, 2, 10, 11, 0, 0, TimeSpan.Zero);

    private static readonly DateOnly TheAuftrittDay = new(2027, 1, 19);
    private static readonly DateOnly TheMeetingDay = new(2027, 1, 20);

    private readonly ApiTestFixture _fixture;

    public GetCalendarTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CarryNoEntry_When_TheCalendarIsEmpty()
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
    public async Task Should_LeaveOutAGroupInternalEntry_When_TheCallerIsNotInThatGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(ctx, "alice", new GetCalendarRequest(), ct);

                Assert.Equal(
                    new[] { DanceGuardPerformance, ClubMeeting, DanceGuardParty, Parade },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheGroupInternalEntry_When_TheCallerBelongsToTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(ctx, "bea", new GetCalendarRequest(), ct);

                Assert.Equal(
                    new[]
                    {
                        DanceGuardTraining,
                        DanceGuardPerformance,
                        ClubMeeting,
                        DanceGuardParty,
                        Parade,
                    },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheGroupInternalEntry_When_TheCallerAdministersTheGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(ctx, "chris", new GetCalendarRequest(), ct);

                Assert.Contains(DanceGuardTraining, TitlesOf(result));
                Assert.DoesNotContain(KinderTraining, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_CarryOnlyClubEntries_When_TheScopeIsClub()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    new GetCalendarRequest { Scope = CalendarScope.Club },
                    ct
                );

                Assert.Equal(new[] { ClubMeeting, Parade }, TitlesOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_CarryOnlyThatGroupsEntries_When_TheScopeIsGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

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

                Assert.Equal(
                    new[] { DanceGuardTraining, DanceGuardPerformance, DanceGuardParty },
                    TitlesOf(result)
                );
            }
        );
    }

    [Fact]
    public async Task Should_RejectTheRequest_When_TheGroupScopeNamesNoGroup()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);
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
    public async Task Should_LeaveOutAnEntryOutsideTheWindow_When_TheWindowIsNarrowed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "alice",
                    new GetCalendarRequest { From = TheAuftrittDay, To = TheMeetingDay },
                    ct
                );

                Assert.Equal(new[] { DanceGuardPerformance, ClubMeeting }, TitlesOf(result));
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
                var ctx = await BuildCalendarAsync(ct);
                var client = await ctx.Identity.ClientForAsync("alice", ct);

                var (response, _) = await client.GETAsync<
                    GetCalendar,
                    GetCalendarRequest,
                    GetCalendarResponse
                >(new GetCalendarRequest { From = TheMeetingDay, To = TheAuftrittDay });

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
                var ctx = await BuildCalendarAsync(ct);
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
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(
                    ctx,
                    "bea",
                    new GetCalendarRequest { Scope = CalendarScope.Club },
                    ct
                );

                var meeting = result.Entries.Single(entry => entry.Title == ClubMeeting);
                Assert.True(meeting.AsksForResponse);
                Assert.Equal(AttendanceAnswer.Yes, meeting.ViewerAnswer);

                var parade = result.Entries.Single(entry => entry.Title == Parade);
                Assert.Null(parade.ViewerAnswer);
            }
        );
    }

    [Fact]
    public async Task Should_NameTheVenueAndTheGroup_When_TheEntryCarriesThem()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildCalendarAsync(ct);

                var result = await ReadAsync(ctx, "bea", new GetCalendarRequest(), ct);

                var training = result.Entries.Single(entry => entry.Title == DanceGuardTraining);
                Assert.Equal("Bühnenhaus", training.VenueName);
                Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), training.OwnerGroupId);
                Assert.Equal("Tanzgarde", training.OwnerGroupName);
                Assert.Equal(CalendarEntryKind.Training, training.Kind);
                Assert.Equal(CalendarEntryVisibility.Group, training.Visibility);

                var parade = result.Entries.Single(entry => entry.Title == Parade);
                Assert.Null(parade.VenueName);
                Assert.Null(parade.OwnerGroupId);
                Assert.Null(parade.OwnerGroupName);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsNoRunningMembership()
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

    private Task<SeededContext> BuildCalendarAsync(CancellationToken ct) =>
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
                                DanceGuardTraining,
                                AtTheDanceGuardTraining,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Group,
                                venueAlias: "buehnenhaus",
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-auftritt",
                                DanceGuardPerformance,
                                AtTheDanceGuardPerformance,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Club,
                                ownerGroupAlias: "tanzgarde"
                            )
                            .AddCalendarEntry(
                                "garde-feier",
                                DanceGuardParty,
                                AtTheDanceGuardParty,
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
                                "club-meeting",
                                ClubMeeting,
                                AtTheMeeting,
                                asksForResponse: true
                            )
                            .AddCalendarEntry(
                                "parade",
                                Parade,
                                AtTheParade,
                                kind: CalendarEntryKind.Performance,
                                visibility: CalendarEntryVisibility.Public
                            )
                            .AddAttendanceResponse(
                                "bea-says-yes",
                                "club-meeting",
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
