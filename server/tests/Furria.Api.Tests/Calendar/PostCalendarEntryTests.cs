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

[Collection("Api")]
public sealed class PostCalendarEntryTests
{
    private const string ValidationField = "request";
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
    public async Task Should_WriteTheClubEntry_When_TheCallerHoldsCalendarManageClub()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            new()
            {
                Title = ClubMeeting,
                Description = "Die erste Sitzung der Session.",
                OwnerGroupId = null,
                VenueId = ctx.Club.Venues.IdOf("buehnenhaus"),
                StartsAt = MeetingStart,
                EndsAt = MeetingEnd,
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = true,
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.VenueCollisions);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHaveTitle(ClubMeeting)
            .CalendarEntry(result.CalendarEntryId)
            .ToBeClubOwned()
            .CalendarEntry(result.CalendarEntryId)
            .ToHaveVenue(ctx.Club.Venues.IdOf("buehnenhaus"))
            .CalendarEntry(result.CalendarEntryId)
            .ToHavePeriod(MeetingStart, MeetingEnd)
            .CalendarEntry(result.CalendarEntryId)
            .ToHaveKind(CalendarEntryKind.Meeting)
            .CalendarEntry(result.CalendarEntryId)
            .ToHaveVisibility(CalendarEntryVisibility.Club)
            .CalendarEntry(result.CalendarEntryId)
            .ToAskForResponse(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheClubEntryComesFromAGroupAdmin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(ClubOwned(ClubMeeting));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Should_WriteTheGroupEntry_When_TheCallerAdministersThatGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

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
                OwnerGroupId = tanzgarde,
                VenueId = null,
                StartsAt = TrainingStart,
                EndsAt = null,
                Kind = CalendarEntryKind.Training,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToHaveOwnerGroup(tanzgarde)
            .CalendarEntry(result.CalendarEntryId)
            .ToHavePeriod(TrainingStart, null)
            .CalendarEntry(result.CalendarEntryId)
            .ToHaveKind(CalendarEntryKind.Training)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheGroupAdminNamesAnotherGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(
            new()
            {
                Title = DanceGuardTraining,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("kindergarde"),
                VenueId = null,
                StartsAt = TrainingStart,
                EndsAt = null,
                Kind = CalendarEntryKind.Training,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [],
            }
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
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [],
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
                                visibility: CalendarEntryVisibility.Group,
                                venueAlias: "buehnenhaus",
                                ownerGroupAlias: "kindergarde"
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
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [],
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
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [],
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
    public async Task Should_ReturnUnauthorized_When_TheCallerSendsNoToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<PostCalendarEntry, PostCalendarEntryRequest, PostCalendarEntryResponse>(
                ClubOwned(ClubMeeting)
            );

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
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
            Kind = CalendarEntryKind.Meeting,
            Visibility = CalendarEntryVisibility.Club,
            AsksForResponse = false,
            ParticipatingGroupIds = [],
        };

    private static void Club(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("ilka", "Ilka", "Kalender")
            .AddAccount("ilka")
            .AddMembership("ilka-first", "ilka", JoinedIn2017)
            .AddPerson("chris", "Chris", "Trainer")
            .AddAccount("chris")
            .AddMembership("chris-first", "chris", JoinedIn2017);

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
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
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
}
