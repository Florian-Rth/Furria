using Furria.Application.Club;
using Furria.Infrastructure.Club;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Calendar;

[Collection("Api")]
public sealed class VenueCollisionTests
{
    private const string Abendprobe = "Abendprobe";
    private const string OffeneWerkstatt = "Offene Werkstatt";

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
    private static readonly DateTimeOffset AlsoInsideTheAbendprobe = new(
        2027,
        1,
        20,
        20,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset BeforeTheAbendprobe = new(
        2027,
        1,
        20,
        16,
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
    private static readonly DateTimeOffset NextDayStart = new(2027, 1, 21, 18, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset NextDayEnd = new(2027, 1, 21, 21, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset TwoDaysLaterStart = new(
        2027,
        1,
        22,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset TwoDaysLaterEnd = new(
        2027,
        1,
        22,
        20,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset OpenEndedStart = new(
        2027,
        1,
        25,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset InsideTheOpenEnd = new(
        2027,
        1,
        25,
        20,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AfterTheOpenEnd = new(
        2027,
        1,
        25,
        22,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public VenueCollisionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FindTheEntry_When_TheWindowsOverlap()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildVenuesAsync(ct);

        var collisions = await CollisionsAsync(
            ctx.Identity.People.IdOf("regine"),
            ctx.Club.Venues.IdOf("buehnenhaus"),
            InsideTheAbendprobe,
            AlsoInsideTheAbendprobe,
            null,
            ct
        );

        var collision = Assert.Single(collisions);
        Assert.Equal(Abendprobe, collision.Title);
    }

    [Fact]
    public async Task Should_FindNothing_When_TheWindowsOnlyTouch()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildVenuesAsync(ct);

        var collisions = await CollisionsAsync(
            ctx.Identity.People.IdOf("regine"),
            ctx.Club.Venues.IdOf("buehnenhaus"),
            AbendprobeEnd,
            AfterTheAbendprobe,
            null,
            ct
        );

        Assert.Empty(collisions);
    }

    [Fact]
    public async Task Should_FindNothing_When_TheWindowsAreDisjoint()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildVenuesAsync(ct);

        var collisions = await CollisionsAsync(
            ctx.Identity.People.IdOf("regine"),
            ctx.Club.Venues.IdOf("buehnenhaus"),
            TwoDaysLaterStart,
            TwoDaysLaterEnd,
            null,
            ct
        );

        Assert.Empty(collisions);
    }

    [Fact]
    public async Task Should_FindTheOpenEndedEntry_When_TheProbeFallsInsideItsThreeHours()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildVenuesAsync(ct);

        var collisions = await CollisionsAsync(
            ctx.Identity.People.IdOf("regine"),
            ctx.Club.Venues.IdOf("buehnenhaus"),
            InsideTheOpenEnd,
            AfterTheOpenEnd,
            null,
            ct
        );

        var collision = Assert.Single(collisions);
        Assert.Equal(OffeneWerkstatt, collision.Title);
    }

    [Fact]
    public async Task Should_FindTheEntry_When_TheProbeItselfIsOpenEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildVenuesAsync(ct);

        var collisions = await CollisionsAsync(
            ctx.Identity.People.IdOf("regine"),
            ctx.Club.Venues.IdOf("buehnenhaus"),
            BeforeTheAbendprobe,
            null,
            null,
            ct
        );

        var collision = Assert.Single(collisions);
        Assert.Equal(Abendprobe, collision.Title);
    }

    [Fact]
    public async Task Should_FindNothing_When_TheOnlyOverlapIsTheEntryBeingEdited()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildVenuesAsync(ct);

        var collisions = await CollisionsAsync(
            ctx.Identity.People.IdOf("regine"),
            ctx.Club.Venues.IdOf("buehnenhaus"),
            AbendprobeStart,
            AbendprobeEnd,
            ctx.Club.CalendarEntries.IdOf("abendprobe"),
            ct
        );

        Assert.Empty(collisions);
    }

    private async Task<IReadOnlyList<CalendarEntrySummary>> CollisionsAsync(
        int viewerPersonId,
        int venueId,
        DateTimeOffset startsAt,
        DateTimeOffset? endsAt,
        int? excludeCalendarEntryId,
        CancellationToken ct
    )
    {
        await using var scope = _fixture.Services.CreateAsyncScope();
        var calendarService = scope.ServiceProvider.GetRequiredService<CalendarService>();

        return await calendarService.FindVenueCollisionsAsync(
            new VenueCollisionQuery
            {
                ViewerPersonId = viewerPersonId,
                VenueId = venueId,
                StartsAt = startsAt,
                EndsAt = endsAt,
                ExcludeCalendarEntryId = excludeCalendarEntryId,
            },
            ct
        );
    }

    private Task<SeededContext> BuildVenuesAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity => identity.AddPerson("regine", "Regine", "Voß"))
                    .Club(club =>
                        club.AddVenue("buehnenhaus", "Bühnenhaus")
                            .AddVenue("vereinsraum", "Vereinsraum", 2)
                            .AddCalendarEntry(
                                "abendprobe",
                                Abendprobe,
                                AbendprobeStart,
                                AbendprobeEnd,
                                venueAlias: "buehnenhaus"
                            )
                            .AddCalendarEntry(
                                "naechster-abend",
                                "Stellprobe",
                                NextDayStart,
                                NextDayEnd,
                                venueAlias: "buehnenhaus"
                            )
                            .AddCalendarEntry(
                                "offene-werkstatt",
                                OffeneWerkstatt,
                                OpenEndedStart,
                                venueAlias: "buehnenhaus"
                            )
                            .AddCalendarEntry(
                                "parallelsitzung",
                                "Vorstandssitzung",
                                InsideTheAbendprobe,
                                AlsoInsideTheAbendprobe,
                                venueAlias: "vereinsraum"
                            )
                    ),
            ct
        );
}
