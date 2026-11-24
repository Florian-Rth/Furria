using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class GetPublicEventsTests : IClassFixture<ApiTestFixture>
{
    private const string FirstGala = "1. Prunksitzung";
    private const string SecondGala = "2. Prunksitzung";
    private const string Opening = "Sessionseröffnung";
    private const string ChildrensCarnival = "Kinderfasching";
    private const string Parade = "Rosenmontagsumzug";
    private const string Teaser = "Der närrische Höhepunkt der Session.";
    private const string AgeHint = "ab 16 Jahren";
    private const int PriceCents = 1_400;

    private static readonly TimeOnly DoorsOpenAt = new(18, 11);

    private static readonly DateTimeOffset Now = new(2027, 1, 10, 12, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset AtTheOpening = new(
        2026,
        11,
        14,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheFirstGala = new(
        2027,
        1,
        16,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheSecondGala = new(
        2027,
        1,
        23,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheChildrensCarnival = new(
        2027,
        2,
        7,
        13,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheParade = new(2027, 2, 8, 13, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset PresaleStarted = new(
        2026,
        12,
        1,
        9,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset PresaleAhead = new(2027, 1, 12, 9, 0, 0, TimeSpan.Zero);

    private readonly ApiTestFixture _fixture;

    public GetPublicEventsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheUpcomingEventsByDate_When_AnAnonymousCallerReadsTheList()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                await BuildSessionAsync(ct);

                var (response, result) = await ReadAsync();

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(
                    [
                        (FirstGala, EventSalesStatus.FewLeft),
                        (SecondGala, EventSalesStatus.PresaleScheduled),
                        (ChildrensCarnival, EventSalesStatus.Cancelled),
                    ],
                    result.Events.Select(listed => (listed.Title, listed.Status))
                );
            }
        );
    }

    private Task<TestResult<GetPublicEventsResponse>> ReadAsync() =>
        _fixture.CreateClient().GETAsync<GetPublicEvents, GetPublicEventsResponse>();

    private Task<SeededContext> BuildSessionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder.Club(club =>
                    club.AddVenue("dgh", "Dorfgemeindehaus", hint: "Eingang Hof")
                        .AddEvent(
                            "opening",
                            Opening,
                            AtTheOpening,
                            "dgh",
                            presaleStartsAt: PresaleStarted
                        )
                        .AddEvent(
                            "second-gala",
                            SecondGala,
                            AtTheSecondGala,
                            "dgh",
                            presaleStartsAt: PresaleAhead
                        )
                        .AddEvent(
                            "first-gala",
                            FirstGala,
                            AtTheFirstGala,
                            "dgh",
                            teaser: Teaser,
                            doorsOpenAt: DoorsOpenAt,
                            ageHint: AgeHint,
                            priceCents: PriceCents,
                            presaleStartsAt: PresaleStarted,
                            ticketAvailability: TicketAvailability.FewLeft
                        )
                        .AddEvent(
                            "childrens-carnival",
                            ChildrensCarnival,
                            AtTheChildrensCarnival,
                            "dgh",
                            cancelledAt: PresaleStarted
                        )
                        .AddCalendarEntry(
                            "parade",
                            Parade,
                            AtTheParade,
                            kind: CalendarEntryKind.Plain,
                            venueAlias: "dgh"
                        )
                ),
            ct
        );
}
