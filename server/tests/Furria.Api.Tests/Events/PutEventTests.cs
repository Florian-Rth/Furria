using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class PutEventTests : IClassFixture<ApiTestFixture>
{
    private const string FirstGala = "1. Prunksitzung";
    private const string RenamedGala = "Große Prunksitzung";
    private const string Teaser = "Der närrische Höhepunkt der Session.";
    private const string NewTeaser = "Fünf Stunden Bütt, Garde und Elferrat.";

    private const int UnknownVenueId = 999_999;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
    private static readonly TimeOnly DoorsOpenAt = new(17, 0);

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
    private static readonly DateTimeOffset AtTheMovedGala = new(
        2027,
        1,
        30,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheMeeting = new(2027, 1, 20, 19, 0, 0, TimeSpan.Zero);
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

    public PutEventTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SaveEveryFact_When_TheKeyHolderEditsTheEvent()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var venueId = ctx.Club.Venues.IdOf("festzelt");

                var (response, _) = await EditAsync(
                    ctx,
                    "vera",
                    Moved(eventId, venueId, PresaleStarted)
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await ctx
                    .Expected.CalendarEntry(eventId)
                    .ToHaveTitle(RenamedGala)
                    .CalendarEntry(eventId)
                    .ToHavePeriod(AtTheMovedGala, null)
                    .CalendarEntry(eventId)
                    .ToHaveVenue(venueId)
                    .CalendarEntry(eventId)
                    .ToHaveKind(CalendarEntryKind.Event)
                    .Event(eventId)
                    .ToHaveTeaser(NewTeaser)
                    .Event(eventId)
                    .ToOpenDoorsAt(DoorsOpenAt)
                    .Event(eventId)
                    .ToHaveAgeHint(null)
                    .Event(eventId)
                    .ToCost(null)
                    .Event(eventId)
                    .ToStartPresaleAt(PresaleStarted)
                    .Event(eventId)
                    .ToHaveTicketAvailability(TicketAvailability.SoldOut)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ForgetTheAvailability_When_ThePresaleStartMovesAhead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");

                var (response, _) = await EditAsync(
                    ctx,
                    "vera",
                    Moved(eventId, ctx.Club.Venues.IdOf("festzelt"), PresaleAhead)
                );

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                await ctx
                    .Expected.Event(eventId)
                    .ToStartPresaleAt(PresaleAhead)
                    .Event(eventId)
                    .ToHaveTicketAvailability(TicketAvailability.Available)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheIdNamesACalendarEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var meetingId = ctx.Club.CalendarEntries.IdOf("club-meeting");

        var (response, _) = await EditAsync(
            ctx,
            "vera",
            Moved(meetingId, ctx.Club.Venues.IdOf("festzelt"), PresaleStarted)
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await ctx
            .Expected.CalendarEntry(meetingId)
            .ToHaveKind(CalendarEntryKind.Meeting)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_SellAtThePickedPlacesInPickOrder_When_ThePlacesAreReplaced()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("first-gala");
        var sparkasse = ctx.Club.Venues.IdOf("sparkasse");
        var festzelt = ctx.Club.Venues.IdOf("festzelt");
        var baeckerei = ctx.Club.Venues.IdOf("baeckerei");

        var (response, _) = await EditAsync(
            ctx,
            "vera",
            Moved(eventId, festzelt, PresaleStarted) with
            {
                PresaleVenueIds = [sparkasse, festzelt, baeckerei],
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.Event(eventId).ToSellAt(sparkasse, festzelt, baeckerei).AssertAsync(ct);
    }

    [Theory]
    [InlineData("alte-post")]
    [InlineData(null)]
    public async Task Should_KeepThePlaces_When_APickedPlaceIsArchivedOrUnknown(string? venueAlias)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("first-gala");
        var festzelt = ctx.Club.Venues.IdOf("festzelt");
        var refused = venueAlias is null ? UnknownVenueId : ctx.Club.Venues.IdOf(venueAlias);

        var (response, _) = await EditAsync(
            ctx,
            "vera",
            Moved(eventId, festzelt, PresaleStarted) with
            {
                PresaleVenueIds = [ctx.Club.Venues.IdOf("sparkasse"), refused],
            }
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.Event(eventId).ToSellAt(festzelt).AssertAsync(ct);
    }

    [Theory]
    [InlineData(2, true)]
    [InlineData(11, false)]
    public async Task Should_RefuseThePlaces_When_TheyRepeatOrAreTooMany(int count, bool repeated)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("first-gala");
        var festzelt = ctx.Club.Venues.IdOf("festzelt");

        var (response, _) = await EditAsync(
            ctx,
            "vera",
            Moved(eventId, festzelt, PresaleStarted) with
            {
                PresaleVenueIds =
                [
                    .. Enumerable.Range(1, count).Select(index => repeated ? festzelt : index),
                ],
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        await ctx.Expected.Event(eventId).ToSellAt(festzelt).AssertAsync(ct);
    }

    private static PutEventRequest Moved(
        int eventId,
        int venueId,
        DateTimeOffset presaleStartsAt
    ) =>
        new()
        {
            EventId = eventId,
            Title = RenamedGala,
            StartsAt = AtTheMovedGala,
            DoorsOpenAt = DoorsOpenAt,
            VenueId = venueId,
            Teaser = NewTeaser,
            Description = null,
            AgeHint = null,
            PriceCents = null,
            PresaleStartsAt = presaleStartsAt,
            PresaleVenueIds = [],
        };

    private static async Task<TestResult<PutEventResponse>> EditAsync(
        SeededContext ctx,
        string alias,
        PutEventRequest request
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.PUTAsync<PutEvent, PutEventRequest, PutEventResponse>(request);
    }

    private Task<SeededContext> BuildClubAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddAccount("vera")
                            .AddMembership("vera-first", "vera", JoinedIn2017)
                            .AddPerson("max", "Max", "Mitglied")
                            .AddAccount("max")
                            .AddMembership("max-first", "max", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "veranstaltungen",
                            "vera-veranstaltungen",
                            "Veranstaltungen",
                            "vera",
                            FurriaPermissions.EventsManage
                        )
                    )
                    .Club(club =>
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddVenue("festzelt", "Festzelt")
                            .AddVenue("baeckerei", "Bäckerei Schmidt")
                            .AddVenue("sparkasse", "Sparkasse")
                            .AddVenue(
                                "alte-post",
                                "Alte Post",
                                archivedOn: new DateOnly(2026, 1, 1)
                            )
                            .AddEvent(
                                "first-gala",
                                FirstGala,
                                AtTheFirstGala,
                                "buergerhaus",
                                Teaser,
                                ageHint: "ab 16 Jahren",
                                priceCents: 2_200,
                                presaleStartsAt: PresaleStarted,
                                ticketAvailability: TicketAvailability.SoldOut
                            )
                            .AddEventPresalePlace("first-gala", "festzelt")
                            .AddCalendarEntry("club-meeting", "Vereinssitzung", AtTheMeeting)
                    ),
            ct
        );
}
