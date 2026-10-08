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
    public async Task Should_ReturnNotFound_When_TheEventIsOver()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var (response, _) = await ReadAsync(ctx.Club.Events.IdOf("opening"));

                Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
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
