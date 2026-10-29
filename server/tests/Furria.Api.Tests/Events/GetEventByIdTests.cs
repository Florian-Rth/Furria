using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Api.Media;
using Furria.Application.Authorization;
using Furria.Core.Events;
using Furria.Core.Media;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Events;

public sealed class GetEventByIdTests : IClassFixture<ApiTestFixture>
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
    public async Task Should_ListThePresalePlacesInPickOrder_When_TheEventNamesThem()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (_, result) = await ReadAsync(ctx, "vera", ctx.Club.Events.IdOf("first-gala"));

        Assert.Equal(
            [
                new EventPresalePlaceDto
                {
                    VenueId = ctx.Club.Venues.IdOf("zeitungsladen"),
                    Name = "Zeitungsladen",
                    IsArchived = true,
                },
                new EventPresalePlaceDto
                {
                    VenueId = ctx.Club.Venues.IdOf("buergerhaus"),
                    Name = "Bürgerhaus",
                    IsArchived = false,
                },
            ],
            result.PresalePlaces
        );
    }

    [Fact]
    public async Task Should_LeaveTheTicketsOpen_When_NoPresalePlaceIsNamed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);

                var (_, result) = await ReadAsync(
                    ctx,
                    "vera",
                    ctx.Club.Events.IdOf("kids-carnival")
                );

                Assert.NotEqual(
                    EventStepState.Done,
                    result.Steps.Single(status => status.Step == EventStep.Tickets).State
                );
            }
        );
    }

    [Fact]
    public async Task Should_PointAtTheRunningOrder_When_DetailsAndTicketsAreDoneButNoRunningOrderExists()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                await EventPictureSteps.UploadAsync(
                    await ctx.Identity.ClientForAsync("vera", ct),
                    eventId,
                    ct
                );

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Empty(result.DetailsMissing);
                Assert.Equal(
                    new EventReviewDto { PublishedAlbums = 0, PublishedNews = 0 },
                    result.Review
                );
                Assert.Equal(
                    [
                        EventStepState.Done,
                        EventStepState.Done,
                        EventStepState.Open,
                        EventStepState.Waiting,
                    ],
                    result.Steps.Select(status => status.State)
                );
                Assert.Equal(EventStep.RunningOrder, result.CurrentStep);
            }
        );
    }

    [Fact]
    public async Task Should_FinishTheRunningOrder_When_EveryActIsPlacedConflictFreeAndConfirmed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var max = ctx.Identity.People.IdOf("max");
                var rede = await CreateActAsync(client, "Büttenrede", added: [max]);
                var lied = await CreateActAsync(client, "Lied");
                await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, 1)]);
                await ConfirmAsync(client, eventId, confirmed: true);

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(EventStepState.Done, RunningOrderStateOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheRunningOrderOpen_When_ItChangedSinceTheConfirmation()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var rede = await CreateActAsync(client, "Büttenrede");
                var lied = await CreateActAsync(client, "Lied");
                var saved = await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, 1)]);
                await ConfirmAsync(client, eventId, confirmed: true);
                await SavedAsync(client, eventId, saved.Version, [Line(lied, 0), Line(rede, 1)]);

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(EventStepState.Open, RunningOrderStateOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheRunningOrderOpen_When_TheConfirmedOrderHasNoActs()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                await SavedAsync(client, eventId, null, []);
                await ConfirmAsync(client, eventId, confirmed: true);

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(EventStepState.Open, RunningOrderStateOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheRunningOrderOpen_When_AnActIsNotPlacedYet()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var rede = await CreateActAsync(client, "Büttenrede");
                var lied = await CreateActAsync(client, "Lied");
                await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, null)]);
                await ConfirmAsync(client, eventId, confirmed: true);

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(EventStepState.Open, RunningOrderStateOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_KeepTheRunningOrderOpen_When_TheConfirmedOrderHasAConflict()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var max = ctx.Identity.People.IdOf("max");
                var rede = await CreateActAsync(client, "Büttenrede", added: [max]);
                var lied = await CreateActAsync(client, "Lied", added: [max]);
                await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, 1)]);
                await ConfirmAsync(client, eventId, confirmed: true);

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(EventStepState.Open, RunningOrderStateOf(result));
            }
        );
    }

    [Fact]
    public async Task Should_ReturnThePictureReadyForRecropping_When_TheEventHasOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("first-gala");
        var pictureId = await EventPictureSteps.RenderedAsync(
            _fixture,
            await ctx.Identity.ClientForAsync("vera", ct),
            eventId,
            ct
        );

        var (_, result) = await ReadAsync(ctx, "vera", eventId);

        var picture = Assert.IsType<PictureEditingDto>(result.Picture);
        Assert.Equal(MediaItemState.Ready, picture.State);
        Assert.StartsWith(
            _fixture.SignedMediaUrl(pictureId, MediaOwner.Event(eventId), MediaRendition.Medium),
            picture.Picture?.MediumUrl
        );
        Assert.NotNull(picture.UncroppedUrl);
        Assert.Equal(
            new PictureCropDto
            {
                Left = 0,
                Top = 0,
                Width = 1,
                Height = 1,
            },
            picture.Crop
        );
    }

    [Fact]
    public async Task Should_ReturnNoPicture_When_TheEventHasNone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var (_, result) = await ReadAsync(ctx, "vera", ctx.Club.Events.IdOf("first-gala"));

        Assert.Null(result.Picture);
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

    private static EventStepState RunningOrderStateOf(GetEventByIdResponse result) =>
        result.Steps.Single(status => status.Step == EventStep.RunningOrder).State;

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
                                ageHint: AgeHint,
                                priceCents: PriceCents,
                                presaleStartsAt: PresaleStarted,
                                ticketAvailability: TicketAvailability.SoldOut
                            )
                            .AddEventPresalePlace("first-gala", "zeitungsladen")
                            .AddEventPresalePlace("first-gala", "buergerhaus")
                            .AddEvent(
                                "kids-carnival",
                                "Kinderfasching",
                                AtTheFirstGala.AddDays(7),
                                "buergerhaus",
                                Teaser,
                                doorsOpenAt: DoorsOpenAt,
                                description: Description,
                                priceCents: PriceCents,
                                presaleStartsAt: PresaleStarted
                            )
                            .AddCalendarEntry("club-meeting", "Vereinssitzung", AtTheMeeting)
                    ),
            ct
        );
}
