using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

[Collection("Api")]
public sealed class GetEventByIdTests
{
    private const string FirstGala = "1. Prunksitzung";
    private const string Teaser = "Der närrische Höhepunkt der Session.";
    private const string Description = "Garde, Bütt und Elferrat.";
    private const string AgeHint = "ab 16 Jahren";
    private const int PriceCents = 2_200;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);
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

    private readonly ApiTestFixture _fixture;

    public GetEventByIdTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnEveryFact_When_TheKeyHolderOpensTheEvent()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");

                var (response, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(eventId, result.EventId);
                Assert.Equal(FirstGala, result.Title);
                Assert.Equal(AtTheFirstGala, result.StartsAt);
                Assert.Equal(FirstGalaEnds, result.EndsAt);
                Assert.Equal(DoorsOpenAt, result.DoorsOpenAt);
                Assert.Equal(ctx.Club.Venues.IdOf("buergerhaus"), result.VenueId);
                Assert.Equal("Bürgerhaus", result.VenueName);
                Assert.Equal(Teaser, result.Teaser);
                Assert.Equal(Description, result.Description);
                Assert.Equal(AgeHint, result.AgeHint);
                Assert.Equal(PriceCents, result.PriceCents);
                Assert.Equal(PresaleStarted, result.PresaleStartsAt);
                Assert.Equal(TicketAvailability.SoldOut, result.TicketAvailability);
                Assert.Null(result.CancelledAt);
                Assert.Equal(EventSalesStatus.SoldOut, result.Status);
                Assert.False(result.IsOver);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheIdNamesACalendarEntryOfAnotherKind()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (response, _) = await ReadAsync(
            ctx,
            "vera",
            ctx.Club.CalendarEntries.IdOf("club-meeting")
        );

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task<TestResult<GetEventByIdResponse>> ReadAsync(
        SeededContext ctx,
        string alias,
        int eventId
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.GETAsync<GetEventById, GetEventByIdRequest, GetEventByIdResponse>(
            new() { EventId = eventId }
        );
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
                            .AddEvent(
                                "first-gala",
                                FirstGala,
                                AtTheFirstGala,
                                "buergerhaus",
                                Teaser,
                                endsAt: FirstGalaEnds,
                                doorsOpenAt: DoorsOpenAt,
                                description: Description,
                                ageHint: AgeHint,
                                priceCents: PriceCents,
                                presaleStartsAt: PresaleStarted,
                                ticketAvailability: TicketAvailability.SoldOut
                            )
                            .AddCalendarEntry("club-meeting", "Vereinssitzung", AtTheMeeting)
                    ),
            ct
        );
}
