using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Events;
using Furria.Core.Media;
using Furria.Core.News;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.Events;

public sealed class GetEventsTests : IClassFixture<ApiTestFixture>
{
    private const string FirstGala = "1. Prunksitzung";
    private const string SecondGala = "2. Prunksitzung";
    private const string Opening = "Sessionseröffnung";
    private const string LastSessionGala = "Prunksitzung 2026";
    private const string NextSessionOpening = "Sessionseröffnung 2027";
    private const string GuardParty = "Gardefeier";
    private const string Carnival = "Kappenabend";
    private const int PriceCents = 2_200;

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

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
    private static readonly DateTimeOffset AtLastSessionsGala = new(
        2026,
        1,
        17,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtNextSessionsOpening = new(
        2027,
        11,
        13,
        18,
        0,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheGuardParty = new(
        2027,
        1,
        17,
        19,
        0,
        0,
        TimeSpan.Zero
    );
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

    public GetEventsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ListTheRelevantSessionUpcomingFirst_When_TheKeyHolderAsks()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildSessionAsync(ct);

                var (response, result) = await ReadAsync(ctx, "vera", ct);

                Assert.Equal(HttpStatusCode.OK, response.StatusCode);
                Assert.Equal(
                    [
                        (FirstGala, false),
                        (SecondGala, false),
                        (NextSessionOpening, false),
                        (Opening, true),
                    ],
                    result.Events.Select(listed => (listed.Title, listed.IsOver))
                );
            }
        );
    }

    [Fact]
    public async Task Should_ShowTheRenderedPictureOfEachEvent_When_TheKeyHolderAsks()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildSessionAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var pictureId = await EventPictureSteps.RenderedAsync(
                    _fixture,
                    client,
                    eventId,
                    ct
                );
                await EventPictureSteps.UploadAsync(
                    client,
                    ctx.Club.Events.IdOf("second-gala"),
                    ct
                );

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                var pictured = result.Events.ToDictionary(
                    listed => listed.Title,
                    listed => listed.Picture?.MediumUrl
                );
                Assert.StartsWith(
                    _fixture.SignedMediaUrl(
                        pictureId,
                        MediaOwner.Event(eventId),
                        MediaRendition.Medium
                    ),
                    pictured[FirstGala]
                );
                Assert.Null(pictured[SecondGala]);
                Assert.Null(pictured[Opening]);
            }
        );
    }

    [Fact]
    public async Task Should_DeriveEachSalesStatus_When_TheEventsStandAtDifferentPoints()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildSessionAsync(ct);

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                Assert.Equal(
                    [
                        (FirstGala, EventSalesStatus.FewLeft),
                        (SecondGala, EventSalesStatus.PresaleScheduled),
                        (NextSessionOpening, EventSalesStatus.Announced),
                        (Opening, EventSalesStatus.Cancelled),
                    ],
                    result.Events.Select(listed => (listed.Title, listed.Status))
                );
            }
        );
    }

    [Fact]
    public async Task Should_NameTheVenue_When_TheEventIsListed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildSessionAsync(ct);

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                var firstGala = Assert.Single(result.Events, listed => listed.Title == FirstGala);
                Assert.Equal(ctx.Club.Events.IdOf("first-gala"), firstGala.EventId);
                Assert.Equal("Bürgerhaus", firstGala.VenueName);
                Assert.Equal(AtTheFirstGala, firstGala.StartsAt);
            }
        );
    }

    [Fact]
    public async Task Should_CarryThePresaleStart_When_ThePresaleIsScheduled()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildSessionAsync(ct);

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                var secondGala = Assert.Single(result.Events, listed => listed.Title == SecondGala);
                Assert.Equal(PresaleAhead, secondGala.PresaleStartsAt);
                var nextOpening = Assert.Single(
                    result.Events,
                    listed => listed.Title == NextSessionOpening
                );
                Assert.Null(nextOpening.PresaleStartsAt);
            }
        );
    }

    [Fact]
    public async Task Should_LayOutTheStepsOfAnEventInPreparation_When_TheKeyHolderAsks()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPlanningAsync(ct);

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                var planned = Assert.Single(result.Events, listed => listed.Title == Carnival);
                Assert.Null(planned.PublishedAt);
                Assert.Equal(Now, planned.CreatedAt);
                Assert.Equal(PriceCents, planned.PriceCents);
                Assert.Null(planned.DoorsOpenAt);
                Assert.Equal(
                    [
                        MissingEventDetail.DoorsOpenAt,
                        MissingEventDetail.Description,
                        MissingEventDetail.Picture,
                        MissingEventDetail.Published,
                    ],
                    planned.DetailsMissing
                );
                Assert.Equal(
                    [
                        new EventStepDto
                        {
                            Step = EventStep.Details,
                            State = EventStepState.Open,
                            DueOn = new DateOnly(2027, 1, 24),
                            OpensOn = null,
                        },
                        new EventStepDto
                        {
                            Step = EventStep.Tickets,
                            State = EventStepState.Open,
                            DueOn = new DateOnly(2027, 1, 24),
                            OpensOn = null,
                        },
                        new EventStepDto
                        {
                            Step = EventStep.RunningOrder,
                            State = EventStepState.Waiting,
                            DueOn = new DateOnly(2027, 3, 6),
                            OpensOn = new DateOnly(2027, 2, 20),
                        },
                        new EventStepDto
                        {
                            Step = EventStep.Review,
                            State = EventStepState.Waiting,
                            DueOn = new DateOnly(2027, 4, 3),
                            OpensOn = new DateOnly(2027, 3, 21),
                        },
                    ],
                    planned.Steps
                );
                Assert.Equal(EventStep.Details, planned.CurrentStep);
            }
        );
    }

    [Fact]
    public async Task Should_CountOnlyWhatTheWebsiteShows_When_TheEventIsReviewed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPlanningAsync(ct);

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                var opening = Assert.Single(result.Events, listed => listed.Title == Opening);
                Assert.Equal(
                    new EventReviewDto { PublishedAlbums = 1, PublishedNews = 1 },
                    opening.Review
                );
                Assert.Equal(
                    EventStepState.Done,
                    opening.Steps.Single(status => status.Step == EventStep.Review).State
                );
            }
        );
    }

    [Fact]
    public async Task Should_FinishOnlyTheRunningOrderThatStands_When_SeveralEventsAreListed()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildPlanningAsync(ct);
                var client = await ctx.Identity.ClientForAsync("vera", ct);
                var lied = await CreateActAsync(client, "Lied");
                var galaId = ctx.Club.Events.IdOf("first-gala");
                var carnivalId = ctx.Club.Events.IdOf("carnival");
                await SavedAsync(client, galaId, null, [Line(lied, 0)]);
                await ConfirmAsync(client, galaId, confirmed: true);
                await SavedAsync(client, carnivalId, null, [Line(lied, 0)]);

                var (_, result) = await ReadAsync(ctx, "vera", ct);

                Assert.Equal(
                    [
                        (FirstGala, EventStepState.Done),
                        (Carnival, EventStepState.Waiting),
                        (Opening, EventStepState.Open),
                    ],
                    result.Events.Select(listed =>
                        (
                            listed.Title,
                            listed
                                .Steps.Single(status => status.Step == EventStep.RunningOrder)
                                .State
                        )
                    )
                );
            }
        );
    }

    private static async Task<TestResult<GetEventsResponse>> ReadAsync(
        SeededContext ctx,
        string alias,
        CancellationToken ct
    )
    {
        var client = await ctx.Identity.ClientForAsync(alias, ct);
        return await client.GETAsync<GetEvents, GetEventsResponse>();
    }

    private Task<SeededContext> BuildSessionAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddAccount("vera")
                            .AddMembership("vera-first", "vera", JoinedIn2017)
                            .AddPerson("ilka", "Ilka", "Kalender")
                            .AddAccount("ilka")
                            .AddMembership("ilka-first", "ilka", JoinedIn2017)
                    )
                    .Roles(roles =>
                        roles
                            .AddRoleWithHolder(
                                "veranstaltungen",
                                "vera-veranstaltungen",
                                "Veranstaltungen",
                                "vera",
                                FurriaPermissions.EventsManage
                            )
                            .AddRoleWithHolder(
                                "terminpflege",
                                "ilka-terminpflege",
                                "Terminpflege",
                                "ilka",
                                FurriaPermissions.CalendarManageClub
                            )
                    )
                    .Club(club =>
                        club.AddVenue("buergerhaus", "Bürgerhaus")
                            .AddEvent(
                                "opening",
                                Opening,
                                AtTheOpening,
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted,
                                cancelledAt: PresaleStarted
                            )
                            .AddEvent(
                                "second-gala",
                                SecondGala,
                                AtTheSecondGala,
                                "buergerhaus",
                                presaleStartsAt: PresaleAhead
                            )
                            .AddEvent(
                                "first-gala",
                                FirstGala,
                                AtTheFirstGala,
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted,
                                ticketAvailability: TicketAvailability.FewLeft
                            )
                            .AddEvent(
                                "last-session-gala",
                                LastSessionGala,
                                AtLastSessionsGala,
                                "buergerhaus"
                            )
                            .AddEvent(
                                "next-session-opening",
                                NextSessionOpening,
                                AtNextSessionsOpening,
                                "buergerhaus"
                            )
                            .AddCalendarEntry(
                                "guard-party",
                                GuardParty,
                                AtTheGuardParty,
                                kind: CalendarEntryKind.Party,
                                visibility: CalendarEntryVisibility.Public,
                                venueAlias: "buergerhaus"
                            )
                    ),
            ct
        );

    private Task<SeededContext> BuildPlanningAsync(CancellationToken ct) =>
        _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("vera", "Vera", "Anstalter")
                            .AddAccount("vera")
                            .AddMembership("vera-first", "vera", JoinedIn2017)
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
                                "carnival",
                                Carnival,
                                new DateTimeOffset(2027, 3, 20, 18, 0, 0, TimeSpan.Zero),
                                "buergerhaus",
                                priceCents: PriceCents,
                                unpublished: true
                            )
                            .AddEvent(
                                "first-gala",
                                FirstGala,
                                AtTheFirstGala,
                                "buergerhaus",
                                priceCents: PriceCents,
                                presaleStartsAt: PresaleStarted
                            )
                            .AddEvent("opening", Opening, AtTheOpening, "buergerhaus")
                    )
                    .Gallery(gallery =>
                        gallery
                            .AddAlbum(
                                "opening-album",
                                Opening,
                                calendarEntryAlias: "opening",
                                publishedAt: Now.AddDays(-30)
                            )
                            .AddAlbum(
                                "opening-outtakes",
                                "Ausschnitte",
                                calendarEntryAlias: "opening"
                            )
                    )
                    .News(news =>
                        news.AddNewsPost(
                                "opening-report",
                                title: "Session eröffnet",
                                teaser: "Der Auftakt.",
                                text: "Ein langer Abend.",
                                category: NewsCategory.Session,
                                eventAlias: "opening",
                                publishedAt: Now.AddDays(-40)
                            )
                            .AddNewsPost("opening-draft", title: "Nachlese", eventAlias: "opening")
                    ),
            ct
        );
}
