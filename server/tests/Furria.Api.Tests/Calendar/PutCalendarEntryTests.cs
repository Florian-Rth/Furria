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
public sealed class PutCalendarEntryTests
{
    private const int UnknownEntryId = 999_999;
    private const string ValidationField = "request";
    private const string GardeTraining = "Training der Tanzgarde";
    private const string GardeAuftritt = "Auftritt der Tanzgarde";
    private const string Abendprobe = "Abendprobe";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);

    private static readonly DateTimeOffset TrainingStart = new(
        2027,
        1,
        18,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset TrainingEnd = new(2027, 1, 18, 21, 0, 0, TimeSpan.Zero);
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
    private static readonly DateTimeOffset InsideTheAbendprobe = new(
        2027,
        1,
        20,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AfterTheAbendprobe = new(
        2027,
        1,
        20,
        22,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutCalendarEntryTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MoveTheEintragToTheVerein_When_TheCallerMayOwnBothEigentuemer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("dana", ct);
        var (response, result) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, GardeAuftritt));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.VenueCollisions);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToBeClubOwned()
            .CalendarEntry(entryId)
            .ToHaveTitle(GardeAuftritt)
            .CalendarEntry(entryId)
            .ToHaveVisibility(CalendarEntryVisibility.Club)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayOwnOnlyTheNewEigentuemer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, GardeAuftritt));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveOwnerGroup(ctx.Groups.Groups.IdOf("tanzgarde"))
            .CalendarEntry(entryId)
            .ToHaveTitle(GardeTraining)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerMayOwnOnlyTheAlteEigentuemer()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(entryId, GardeAuftritt));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveOwnerGroup(ctx.Groups.Groups.IdOf("tanzgarde"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SaveTheChanges_When_TheEigentuemerStaysTheSame()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = GardeAuftritt,
                Description = "Auftritt statt Training.",
                OwnerGroupId = tanzgarde,
                VenueId = null,
                StartsAt = TrainingStart,
                EndsAt = TrainingEnd,
                Kind = CalendarEntryKind.Performance,
                Visibility = CalendarEntryVisibility.Group,
                AsksForResponse = true,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveOwnerGroup(tanzgarde)
            .CalendarEntry(entryId)
            .ToHaveTitle(GardeAuftritt)
            .CalendarEntry(entryId)
            .ToHaveKind(CalendarEntryKind.Performance)
            .CalendarEntry(entryId)
            .ToHavePeriod(TrainingStart, TrainingEnd)
            .CalendarEntry(entryId)
            .ToAskForResponse(true)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_WarnAboutTheOrtAndStillWrite_When_TheNeueZeitClashesAtThatOrt()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");
        var buehnenhaus = ctx.Club.Venues.IdOf("buehnenhaus");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, result) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = GardeTraining,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = buehnenhaus,
                StartsAt = InsideTheAbendprobe,
                EndsAt = AfterTheAbendprobe,
                Kind = CalendarEntryKind.Training,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var collision = Assert.Single(result.VenueCollisions);
        Assert.Equal(ctx.Club.CalendarEntries.IdOf("abendprobe"), collision.CalendarEntryId);
        Assert.Equal(Abendprobe, collision.Title);
        Assert.Equal(AbendprobeStart, collision.StartsAt);
        Assert.Equal(AbendprobeEnd, collision.EndsAt);
        await ctx
            .Expected.CalendarEntry(entryId)
            .ToHaveVenue(buehnenhaus)
            .CalendarEntry(entryId)
            .ToHavePeriod(InsideTheAbendprobe, AfterTheAbendprobe)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheOrt_When_ErArchiviertIst()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var entryId = ctx.Club.CalendarEntries.IdOf("garde-training");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = entryId,
                Title = GardeTraining,
                Description = null,
                OwnerGroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                VenueId = ctx.Club.Venues.IdOf("altes-lager"),
                StartsAt = TrainingStart,
                EndsAt = TrainingEnd,
                Kind = CalendarEntryKind.Training,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(
            ["Ein archivierter Ort kann nicht mehr gewählt werden."],
            failures[ValidationField]
        );
        await ctx.Expected.CalendarEntry(entryId).ToBeHeldAt(null).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEintragIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("dana", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(ClubOwned(UnknownEntryId, GardeAuftritt));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static PutCalendarEntryRequest ClubOwned(int calendarEntryId, string title) =>
        new()
        {
            CalendarEntryId = calendarEntryId,
            Title = title,
            Description = null,
            OwnerGroupId = null,
            VenueId = null,
            StartsAt = TrainingStart,
            EndsAt = TrainingEnd,
            Kind = CalendarEntryKind.Performance,
            Visibility = CalendarEntryVisibility.Club,
            AsksForResponse = false,
        };

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                            .AddPerson("chris", "Chris", "Trainer")
                            .AddAccount("chris")
                            .AddMembership("chris-first", "chris", JoinedIn2017)
                            .AddPerson("dana", "Dana", "Doppelt")
                            .AddAccount("dana")
                            .AddMembership("dana-first", "dana", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "terminpflege",
                                "ilka-terminpflege",
                                "Terminpflege",
                                "ilka",
                                FurriaPermissions.CalendarManageClub
                            )
                            .AddRoleHolding("dana-terminpflege", "terminpflege", "dana")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupAdmin(
                                "chris-tanzgarde",
                                "tanzgarde",
                                "chris",
                                "Trainer",
                                JoinedIn2017
                            )
                            .AddGroupAdmin(
                                "dana-tanzgarde",
                                "tanzgarde",
                                "dana",
                                "Trainerin",
                                JoinedIn2017
                            )
                    )
                    .Club(club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddVenue("altes-lager", "Altes Lager", archivedOn: ArchivedIn2026)
                            .AddCalendarEntry(
                                "garde-training",
                                GardeTraining,
                                TrainingStart,
                                TrainingEnd,
                                kind: CalendarEntryKind.Training,
                                visibility: CalendarEntryVisibility.Club,
                                ownerGroupAlias: "tanzgarde"
                            )
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
