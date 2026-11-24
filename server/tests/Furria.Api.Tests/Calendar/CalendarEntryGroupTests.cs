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

public sealed class CalendarEntryGroupTests : IClassFixture<ApiTestFixture>
{
    private const string ValidationField = "request";
    private const string GalaSession = "Prunksitzung";
    private const string DanceGuardTraining = "Training der Tanzgarde";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly DateOnly ArchivedIn2026 = new(2026, 6, 30);

    private static readonly DateTimeOffset GalaSessionStart = new(
        2027,
        2,
        6,
        19,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset GalaSessionEnd = new(
        2027,
        2,
        6,
        23,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public CalendarEntryGroupTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_DropTheOwner_When_ItIsAlsoNamedAsParticipating()
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
                StartsAt = GalaSessionStart,
                EndsAt = GalaSessionEnd,
                Kind = CalendarEntryKind.Training,
                Audience = CalendarEntryAudience.Groups,
                AudienceGroupIds = [tanzgarde],
                AudiencePersonIds = [],
                AddOns = [PostAddOn(CalendarEntryAddOnKind.ParticipatingGroups)],
                ParticipatingGroupIds = [tanzgarde, ctx.Groups.Groups.IdOf("kindergarde")],
                Notify = false,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToCarryParticipatingGroups(ctx.Groups.Groups.IdOf("kindergarde"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropTheParticipatingGroups_When_TheirAddOnIsRemoved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildGalaSessionAsync(ct);
        var calendarEntryId = ctx.Club.CalendarEntries.IdOf("gala-session");

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = calendarEntryId,
                Title = GalaSession,
                Description = null,
                OwnerGroupId = null,
                VenueId = null,
                StartsAt = GalaSessionStart,
                EndsAt = GalaSessionEnd,
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(calendarEntryId)
            .ToCarryNoParticipatingGroup()
            .CalendarEntry(calendarEntryId)
            .ToCarryAddOns()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheEntry_When_AParticipatingGroupIsArchived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(ClubOwned([ctx.Groups.Groups.IdOf("altgarde")]));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Eine archivierte Gruppe kann nicht mitwirken."], failures[ValidationField]);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyAdministersAParticipatingGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildGalaSessionAsync(ct);
        var calendarEntryId = ctx.Club.CalendarEntries.IdOf("gala-session");

        var client = await ctx.Identity.ClientForAsync("chris", ct);
        var (response, _) = await client.PUTAsync<
            PutCalendarEntry,
            PutCalendarEntryRequest,
            PutCalendarEntryResponse
        >(
            new()
            {
                CalendarEntryId = calendarEntryId,
                Title = "Umbenannt",
                Description = null,
                OwnerGroupId = null,
                VenueId = null,
                StartsAt = GalaSessionStart,
                EndsAt = GalaSessionEnd,
                Kind = CalendarEntryKind.Plain,
                Audience = CalendarEntryAudience.Club,
                AudienceGroupIds = [],
                AudiencePersonIds = [],
                AddOns = [],
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(calendarEntryId)
            .ToHaveTitle(GalaSession)
            .CalendarEntry(calendarEntryId)
            .ToCarryParticipatingGroups(ctx.Groups.Groups.IdOf("tanzgarde"))
            .AssertAsync(ct);
    }

    private static PostCalendarEntryRequest ClubOwned(IReadOnlyList<int> participatingGroupIds) =>
        new()
        {
            Title = GalaSession,
            Description = null,
            OwnerGroupId = null,
            VenueId = null,
            StartsAt = GalaSessionStart,
            EndsAt = GalaSessionEnd,
            Kind = CalendarEntryKind.Plain,
            Audience = CalendarEntryAudience.Club,
            AudienceGroupIds = [],
            AudiencePersonIds = [],
            AddOns = [PostAddOn(CalendarEntryAddOnKind.ParticipatingGroups)],
            ParticipatingGroupIds = participatingGroupIds,
            Notify = false,
        };

    private static void Club(IdentitySeedBuilder identity) =>
        identity
            .AddPerson("ilka", "Ilka", "Kalender")
            .AddAccount("ilka")
            .AddMembership("ilka-first", "ilka", JoinedIn2017)
            .AddPerson("bea", "Bea", "Garde")
            .AddAccount("bea")
            .AddMembership("bea-first", "bea", JoinedIn2017)
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

    private static void Groups(GroupSeedBuilder groups) =>
        groups
            .AddGroup("tanzgarde", "Tanzgarde")
            .AddGroup("kindergarde", "Kindergarde")
            .AddGroup("altgarde", "Altgarde", archivedOn: ArchivedIn2026)
            .AddGroupMembership("bea-tanzgarde", "tanzgarde", "bea", JoinedIn2017)
            .AddGroupAdmin("chris-tanzgarde", "tanzgarde", "chris", "Trainer", JoinedIn2017);

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder => builder.Identity(Club).Roles(CalendarRole).Groups(Groups),
            ct
        );

    private Task<SeededContext> BuildGalaSessionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(Club)
                    .Roles(CalendarRole)
                    .Groups(Groups)
                    .Club(club =>
                        club.AddCalendarEntry(
                            "gala-session",
                            GalaSession,
                            GalaSessionStart,
                            GalaSessionEnd,
                            participatingGroupAliases: ["tanzgarde"]
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

    private static PostCalendarEntryAddOnDataDto PostAddOn(CalendarEntryAddOnKind kind) =>
        new()
        {
            Kind = kind,
            Poll = null,
            SignUpList = null,
            DaySchedule = null,
        };
}
