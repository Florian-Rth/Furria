using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Core.Club;
using Furria.Core.Events;
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
                                kind: CalendarEntryKind.Plain,
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
                    ),
            ct
        );
}
