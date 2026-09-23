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
public sealed class CalendarEntryGroupTests
{
    private const string ValidationField = "request";
    private const string GalaSession = "Prunksitzung";
    private const string DanceGuardTraining = "Training der Tanzgarde";
    private const int UnknownGroupId = 999_999;

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
    public async Task Should_CarryTheParticipatingGroups_When_TheEntryNamesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var result = await WriteAsync(
            ctx,
            "ilka",
            ClubOwned([ctx.Groups.Groups.IdOf("tanzgarde"), ctx.Groups.Groups.IdOf("kindergarde")]),
            ct
        );

        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToCarryParticipatingGroups(
                ctx.Groups.Groups.IdOf("tanzgarde"),
                ctx.Groups.Groups.IdOf("kindergarde")
            )
            .AssertAsync(ct);
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
                Visibility = CalendarEntryVisibility.Group,
                AsksForResponse = false,
                ParticipatingGroupIds = [tanzgarde, ctx.Groups.Groups.IdOf("kindergarde")],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToCarryParticipatingGroups(ctx.Groups.Groups.IdOf("kindergarde"))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StoreTheGroupOnce_When_ItIsNamedTwice()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

        var result = await WriteAsync(ctx, "ilka", ClubOwned([tanzgarde, tanzgarde]), ct);

        await ctx
            .Expected.CalendarEntry(result.CalendarEntryId)
            .ToCarryParticipatingGroups(tanzgarde)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReplaceTheParticipatingGroups_When_TheEntryIsUpdated()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildGalaSessionAsync(ct);
        var calendarEntryId = ctx.Club.CalendarEntries.IdOf("gala-session");
        var kindergarde = ctx.Groups.Groups.IdOf("kindergarde");

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
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [kindergarde],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(calendarEntryId)
            .ToCarryParticipatingGroups(kindergarde)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepTheParticipatingGroup_When_TheEntryIsSavedUnchanged()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildGalaSessionAsync(ct);
        var calendarEntryId = ctx.Club.CalendarEntries.IdOf("gala-session");
        var tanzgarde = ctx.Groups.Groups.IdOf("tanzgarde");

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
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [tanzgarde],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(calendarEntryId)
            .ToCarryParticipatingGroups(tanzgarde)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_DropAllParticipatingGroups_When_TheEntryNamesNoneAnymore()
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
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
                ParticipatingGroupIds = [],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(calendarEntryId)
            .ToCarryNoParticipatingGroup()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheEntry_When_AParticipatingGroupIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var (response, _) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(ClubOwned([UnknownGroupId]));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Gruppe gibt es nicht."], failures[ValidationField]);
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
                Kind = CalendarEntryKind.Meeting,
                Visibility = CalendarEntryVisibility.Club,
                AsksForResponse = false,
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

    [Fact]
    public async Task Should_LeaveOutTheParticipatingGroupEntry_When_TheGroupScopeIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildGalaSessionAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, result) = await client.GETAsync<
            GetCalendar,
            GetCalendarRequest,
            GetCalendarResponse
        >(
            new GetCalendarRequest
            {
                Scope = CalendarScope.Group,
                GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
                From = new DateOnly(2027, 1, 1),
                To = new DateOnly(2027, 3, 1),
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Empty(result.Entries);
    }

    [Fact]
    public async Task Should_NameTheParticipatingGroup_When_TheCalendarIsRead()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildGalaSessionAsync(ct);

        var client = await ctx.Identity.ClientForAsync("bea", ct);
        var (response, result) = await client.GETAsync<
            GetCalendar,
            GetCalendarRequest,
            GetCalendarResponse
        >(
            new GetCalendarRequest
            {
                From = new DateOnly(2027, 1, 1),
                To = new DateOnly(2027, 3, 1),
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var entry = Assert.Single(result.Entries);
        var participant = Assert.Single(entry.ParticipatingGroups);
        Assert.Equal(ctx.Groups.Groups.IdOf("tanzgarde"), participant.GroupId);
        Assert.Equal("Tanzgarde", participant.Name);
        Assert.Null(entry.OwnerGroupTone);
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
            Kind = CalendarEntryKind.Meeting,
            Visibility = CalendarEntryVisibility.Club,
            AsksForResponse = false,
            ParticipatingGroupIds = participatingGroupIds,
        };

    private static async Task<PostCalendarEntryResponse> WriteAsync(
        SeededContext ctx,
        string alias,
        PostCalendarEntryRequest request,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        var (response, result) = await client.POSTAsync<
            PostCalendarEntry,
            PostCalendarEntryRequest,
            PostCalendarEntryResponse
        >(request);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return result;
    }

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
}
