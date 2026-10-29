using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class GetPublicEventByIdTests : IClassFixture<ApiTestFixture>
{
    private const string FirstGala = "1. Prunksitzung";
    private const string Teaser = "Der närrische Höhepunkt der Session.";
    private const string Description = "Garde, Bütt und Elferrat.\n\nGefeiert wird im Saal.";
    private const int PriceCents = 2_200;

    private static readonly TimeOnly DoorsOpenAt = new(17, 30);
    private static readonly TimeOnly Nine = new(9, 0);
    private static readonly TimeOnly Noon = new(12, 0);
    private static readonly TimeOnly Two = new(14, 0);
    private static readonly TimeOnly Six = new(18, 0);

    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheFirstGala = new(
        2027,
        1,
        16,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset FirstGalaEnds = new(
        2027,
        1,
        17,
        0,
        30,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset FirstGalaDoorsOpen = new(
        2027,
        1,
        16,
        16,
        30,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheOpening = new(
        2026,
        11,
        14,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheParty = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset PresaleStarted = new(
        2026,
        12,
        1,
        9,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public GetPublicEventByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnTheEventsPage_When_AnAnonymousCallerOpensAnUpcomingEvent()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");

                var (response, result) = await ReadAsync(eventId);

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(eventId, result.EventId);
                Assert.Equal(FirstGala, result.Title);
                Assert.Equal(AtTheFirstGala, result.StartsAt);
                Assert.Equal(FirstGalaEnds, result.EndsAt);
                Assert.Equal(FirstGalaDoorsOpen, result.DoorsOpenAt);
                Assert.Equal(Teaser, result.Teaser);
                Assert.Equal(Description, result.Description);
                Assert.Equal(PriceCents, result.PriceCents);
                Assert.Equal(EventSalesStatus.SoldOut, result.Status);
                Assert.Equal("Bürgerhaus", result.Venue.Name);
                Assert.Equal("Großfurra", result.Venue.City);
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheRunningPresalePlacesWithTheirHours_When_TicketsAreOnSale()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var (_, result) = await ReadAsync(ctx.Club.Events.IdOf("kids-carnival"));

                Assert.Equal(EventSalesStatus.Available, result.Status);
                Assert.Equal(
                    ["Bäckerei Schmidt", "Bürgerhaus"],
                    result.PresalePlaces.Select(place => place.Name)
                );
                var bakery = result.PresalePlaces[0];
                Assert.Equal(
                    ("Marktplatz 2", "99713", "Großfurra", "Karten an der Kasse"),
                    (bakery.Street, bakery.Zip, bakery.City, bakery.Hint)
                );
                Assert.Equal(
                    [
                        (DayOfWeek.Monday, Nine, Noon),
                        (DayOfWeek.Monday, Two, Six),
                        (DayOfWeek.Saturday, Nine, Noon),
                    ],
                    bakery.OpeningHours.Select(slot => (slot.Weekday, slot.Opens, slot.Closes))
                );
            }
        );
    }

    [Fact]
    public async Task Should_ShowNoPresalePlace_When_TheEveningIsSoldOut()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var (_, result) = await ReadAsync(ctx.Club.Events.IdOf("first-gala"));

                Assert.Empty(result.PresalePlaces);
            }
        );
    }

    [Fact]
    public async Task Should_CarryTheEventsPictureAtItsCut_When_TheEventHasOne()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var pictureId = await EventPictureSteps.RenderedAsync(
                    _fixture,
                    await ctx.Identity.ManagingLoginClientAsync(ct),
                    eventId,
                    ct
                );

                var (_, result) = await ReadAsync(eventId);

                Assert.Equal((800, 400), (result.Picture?.Width, result.Picture?.Height));
                Assert.StartsWith(
                    $"/api/public/events/pictures/{pictureId}/medium?v=",
                    result.Picture?.MediumUrl
                );
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheIdNamesAPublicEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var (response, _) = await ReadAsync(ctx.Club.CalendarEntries.IdOf("guard-party"));

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            }
        );
    }

    private Task<TestResult<GetPublicEventByIdResponse>> ReadAsync(int eventId) =>
        _fixture
            .CreateClient()
            .GETAsync<GetPublicEventById, GetPublicEventByIdRequest, GetPublicEventByIdResponse>(
                new() { EventId = eventId }
            );

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("buergerhaus", "Bürgerhaus")
                        .AddVenue(
                            "baeckerei",
                            "Bäckerei Schmidt",
                            street: "Marktplatz 2",
                            zip: "99713",
                            city: "Großfurra",
                            hint: "Karten an der Kasse"
                        )
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Saturday, Nine, Noon)
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Monday, Two, Six)
                        .AddVenueOpeningSlot("baeckerei", DayOfWeek.Monday, Nine, Noon)
                        .AddVenue(
                            "zeitungsladen",
                            "Zeitungsladen",
                            archivedOn: new DateOnly(2026, 6, 1)
                        )
                        .AddEvent(
                            "first-gala",
                            FirstGala,
                            AtTheFirstGala,
                            "buergerhaus",
                            Teaser,
                            endsAt: FirstGalaEnds,
                            doorsOpenAt: DoorsOpenAt,
                            description: Description,
                            priceCents: PriceCents,
                            presaleStartsAt: PresaleStarted,
                            ticketAvailability: TicketAvailability.SoldOut
                        )
                        .AddEventPresalePlace("first-gala", "baeckerei")
                        .AddEvent(
                            "kids-carnival",
                            "Kinderfasching",
                            AtTheFirstGala.AddDays(7),
                            "buergerhaus",
                            Teaser,
                            priceCents: PriceCents,
                            presaleStartsAt: PresaleStarted
                        )
                        .AddEventPresalePlace("kids-carnival", "baeckerei")
                        .AddEventPresalePlace("kids-carnival", "zeitungsladen")
                        .AddEventPresalePlace("kids-carnival", "buergerhaus")
                        .AddEvent("opening", "Sessionseröffnung", AtTheOpening, "buergerhaus")
                        .AddCalendarEntry(
                            "guard-party",
                            "Gardefeier",
                            AtTheParty,
                            kind: CalendarEntryKind.Party,
                            visibility: CalendarEntryVisibility.Public,
                            venueAlias: "buergerhaus"
                        )
                ),
            ct
        );
}
