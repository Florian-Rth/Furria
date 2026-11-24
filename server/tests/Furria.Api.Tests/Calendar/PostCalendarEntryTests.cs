using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Calendar;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Calendar;

public sealed class PostCalendarEntryTests : IClassFixture<ApiTestFixture>
{
    private const string ValidationField = "request";
    private const string AudienceField = "audience";
    private const string TrainingForTheClubMessage = "Ein Training ist nie für den ganzen Verein.";
    private const string ClubMeeting = "Vereinssitzung";
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const string Abendprobe = "Abendprobe";
    private const string CrisisMeeting = "Krisensitzung Kassenprüfung";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);

    private static readonly DateTimeOffset MeetingStart = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset MeetingEnd = new(2027, 1, 20, 22, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AbendprobeStart = new(
        2027,
        1,
        20,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AbendprobeEnd = new(
        2027,
        1,
        20,
        21,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset TrainingStart = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PostCalendarEntryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_WriteTheSameInstants_When_TheTimesCarryALocalOffset()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var berlinWinter = TimeSpan.FromHours(1);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            new()
            {
                Title = ClubMeeting,
                Description = null,
                OwnerGroupId = null,
                VenueId = ctx.Club.Venues.IdOf("buehnenhaus"),
                StartsAt = MeetingStart.ToOffset(berlinWinter),
                EndsAt = MeetingEnd.ToOffset(berlinWinter),
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
                Notify = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHavePeriod(MeetingStart, MeetingEnd)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupAdminSchedulesForTheWholeClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await PostAsGroupAdminAsync(
            ctx,
            DanceGuardTrainingFor(ctx) with
            {
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
            },
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupAdminSchedulesForAForeignGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await PostAsGroupAdminAsync(
            ctx,
            DanceGuardTrainingFor(ctx) with
            {
                AudienceGroupIds =
                [
                    ctx.Groups.Groups.IdOf("tanzgarde"),
                    ctx.Groups.Groups.IdOf("kindergarde"),
                ],
            },
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupAdminChoosesSomeoneOutsideHerGroups()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await PostAsGroupAdminAsync(
            ctx,
            DanceGuardTrainingFor(ctx) with
            {
                Audience = CalendarEntryAudience.People,
                AudienceGroupIds = [],
                AudiencePersonIds =
                [
                    ctx.Identity.People.IdOf("tina"),
                    ctx.Identity.People.IdOf("kalle"),
                ],
            },
            ct
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_WarnAboutTheVenueAndStillWrite_When_AnotherEntryHoldsItAtThatTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(Club)
                    .Roles(CalendarRole)
                    .Club(club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddCalendarEntry(
                                "abendprobe",
                                Abendprobe,
                                AbendprobeStart,
                                AbendprobeEnd,
                                venueAlias: "buehnenhaus"
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            new()
            {
                Title = ClubMeeting,
                Description = null,
                OwnerGroupId = null,
                VenueId = ctx.Club.Venues.IdOf("buehnenhaus"),
                StartsAt = MeetingStart,
                EndsAt = MeetingEnd,
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
                Notify = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var collision = Assert.Single(result.VenueCollisions);
        Assert.Equal(ctx.Club.CalendarEntries.IdOf("abendprobe"), collision.CalendarEntryId);
        Assert.Equal(Abendprobe, collision.Title);
        Assert.Equal(AbendprobeStart, collision.StartsAt);
        Assert.Equal(AbendprobeEnd, collision.EndsAt);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHaveTitle(ClubMeeting)
            .CalendarEntry(result.CalendarEntryId)
            .ToHaveVenue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_LeaveTheForeignEntryOutOfTheWarning_When_TheCallerMayNotReadIt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(Club)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
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
                                "crisis-meeting",
                                CrisisMeeting,
                                AbendprobeStart,
                                AbendprobeEnd,
                                venueAlias: "buehnenhaus",
                                ownerGroupAlias: "kindergarde",
                                audiencePersonAliases: ["ilka"]
                            )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            new()
            {
                Title = DanceGuardTraining,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = ctx.Club.Venues.IdOf("buehnenhaus"),
                StartsAt = MeetingStart,
                EndsAt = MeetingEnd,
                Kind = CalendarEntryKind.Training,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
                Notify = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.VenueCollisions);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHaveVenue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheVenue_When_ItIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(Club)
                    .Roles(CalendarRole)
                    .Club(club =>
                        club.AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2026)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            new()
            {
                Title = ClubMeeting,
                Description = null,
                OwnerGroupId = null,
                VenueId = ctx.Club.Venues.IdOf("altes-lager"),
                StartsAt = MeetingStart,
                EndsAt = MeetingEnd,
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
                Notify = false,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ValidationField]
        );
    }

    [Fact]
    public async Task Should_ReturnBadRequest_When_ATrainingIsForTheWholeClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(ClubOwned(DanceGuardTraining) with { Kind = CalendarEntryKind.Training });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal([TrainingForTheClubMessage], failures[AudienceField]);
    }

    [Fact]
    public async Task Should_ChooseThePeople_When_TheyMayUseTheAppWithoutAClubMembership()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var kalle = ctx.Identity.People.IdOf("kalle");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            ClubOwned(ClubMeeting) with
            {
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [kalle],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHaveAudience(CalendarEntryAudience.People)
            .CalendarEntry(result.CalendarEntryId)
            .ToChoosePeople(kalle)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_AChosenPersonMayNotUseTheApp()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            ClubOwned(ClubMeeting) with
            {
                Audience = CalendarEntryAudience.People,
                AudiencePersonIds = [ctx.Identity.People.IdOf("fred")],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task Should_CountTheClubDays_When_TheEntryRunsPastMidnightInTheClubsTimeZone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var lateEvening = new DateTimeOffset(2027, 1, 20, 22, 30, 0, TimeSpan.Zero);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            ClubOwned(ClubMeeting) with
            {
                StartsAt = lateEvening,
                EndsAt = lateEvening.AddHours(1),
                AddOns = [DayScheduleAddOn(null, (1, new TimeOnly(0, 15), "Heimfahrt"))],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHaveDayScheduleSteps((0, 1, new TimeOnly(0, 15), "Heimfahrt"))
            .AssertAsync(ct);
    }

    [Theory]
    [InlineData(1, "Rückfahrt")]
    [InlineData(-1, "Vorabend")]
    [InlineData(0, "   ")]
    public async Task Should_ReturnBadRequest_When_AStepIsInvalid(int day, string text)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            ClubOwned(ClubMeeting) with
            {
                AddOns = [DayScheduleAddOn(null, (day, new TimeOnly(10, 0), text))],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Should_ReturnUnprocessableEntity_When_OnlyTheOwnerWouldParticipate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            ClubOwned(DanceGuardTraining) with
            {
                OwnerGroupId = tanzgarde,
                Kind = CalendarEntryKind.Training,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [tanzgarde],
                AddOns = [PostAddOn(CalendarEntryAddOnKind.ParticipatingGroups)],
                ParticipatingGroupIds = [tanzgarde],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Wähle mindestens eine mitwirkende Gruppe."], failures[ValidationField]);
    }

    private static PostCalendarEntryRequest DanceGuardTrainingFor(SeededContext ctx) =>
        new()
        {
            Title = DanceGuardTraining,
            Description = null,
            OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            VenueId = null,
            StartsAt = TrainingStart,
            EndsAt = null,
            Kind = CalendarEntryKind.Training,
            Audience = CalendarEntryAudience.Groups,
            AudienceGroupIds = [ctx.Groups.Groups.IdOf("tanzgarde")],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
            Notify = false,
        };

    private static async Task<HttpResponseMessage> PostAsGroupAdminAsync(
        SeededContext ctx,
        PostCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(request);

        return response;
    }

    private static PostCalendarEntryRequest ClubOwned(string title) =>
        new()
        {
            Title = title,
            Description = null,
            OwnerGroupId = null,
            VenueId = null,
            StartsAt = MeetingStart,
            EndsAt = MeetingEnd,
            Kind = CalendarEntryKind.Plain,
            Audience = CalendarEntryAudience.Club,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            AddOns = [],
            ParticipatingGroupIds = [],
            Notify = false,
        };

    private static void Club(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("ilka", "Ilka", "Kalender")
            .AddAccount("ilka")
            .AddMembership("ilka-first", "ilka", JoinedIn2017)
            .AddPerson("chris", "Chris", "Trainer")
            .AddAccount("chris")
            .AddMembership("chris-first", "chris", JoinedIn2017)
            .AddPerson("kalle", "Kalle", "Kindergarde")
            .AddPerson("tina", "Tina", "Tanzgarde")
            .AddPerson("fred", "Fred", "Fremd");

    private static void CalendarRole(RoleSeedBuilder roles) =>
        roles.AddRoleWithHolder(
            "terminpflege",
            "ilka-terminpflege",
            "Terminpflege",
            "ilka",
            FurriaPermissions.CalendarManageClub
        );

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(Club)
                    .Roles(CalendarRole)
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroup("kindergarde", "Kindergarde")
                            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2026)
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                            .AddGroupMembership("tina-tanzgarde", "tanzgarde", "tina", JoinedIn2017)
                            .AddGroupMembership(
                                "kalle-kindergarde",
                                "kindergarde",
                                "kalle",
                                JoinedIn2017
                            )
                    )
                    .Club(club => club.AddVenue("buehnenhaus", "Bühnenhaus")),
            ct
        );

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }

    private static PostCalendarEntryAddOnDataDto PostAddOn(CalendarEntryAddOnKind kind) =>
        new()
        {
            Kind = kind,
            Poll = null,
            SignUpList = null,
            DaySchedule = null,
        };

    private static PostCalendarEntryAddOnDataDto DayScheduleAddOn(
        string? title,
        params (int Day, TimeOnly Time, string Text)[] steps
    ) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.DaySchedule,
            Poll = null,
            SignUpList = null,
            DaySchedule = new()
            {
                DayScheduleId = null,
                Title = title,
                Steps =
                [
                    .. steps.Select(step => new PostCalendarEntryDayScheduleStepDataDto
                    {
                        StepId = null,
                        Day = step.Day,
                        Time = step.Time,
                        Text = step.Text,
                    }),
                ],
            },
        };
}
