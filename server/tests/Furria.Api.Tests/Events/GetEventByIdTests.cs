using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Api.Media;
using Furria.Api.Tests.Halls;
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
    private const string MaxSolo = "max-solo";
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
                var maxSolo = ctx.Groups.Groups.IdOf(MaxSolo);
                var rede = await CreateActAsync(client, "Büttenrede", maxSolo);
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
                var maxSolo = ctx.Groups.Groups.IdOf(MaxSolo);
                var rede = await CreateActAsync(client, "Büttenrede", maxSolo);
                var lied = await CreateActAsync(client, "Lied", maxSolo);
                await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, 1)]);
                await ConfirmAsync(client, eventId, confirmed: true);

                var (_, result) = await ReadAsync(ctx, "vera", eventId);

                Assert.Equal(EventStepState.Open, RunningOrderStateOf(result));
            }
        );
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
                    .Groups(groups =>
                        groups
                            .AddGroup(MaxSolo, "Solo Max")
                            .AddGroupMembership("max-solo-member", MaxSolo, "max", JoinedIn2017)
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

    [Fact]
    public async Task Should_ShowTheSavedCountsAndFinishTheHallStep_When_TablesStand()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(HallSeeds.HallManagerWithGala(_fixture.Today), ct);
        var hallManager = await ctx.Identity.ClientForAsync(HallSeeds.HallManager, ct);
        var eventId = ctx.Club.Events.IdOf(HallSeeds.Gala);
        var hallId = await HallSteps.CreateHallAsync(
            hallManager,
            ctx.Club.Venues.IdOf(HallSeeds.Buergerhaus),
            "Saal"
        );
        await HallSteps.CreatePlanAsync(hallManager, eventId, hallId);
        await HallSteps.SavedPlanAsync(
            hallManager,
            eventId,
            hallId,
            1,
            [
                HallSteps.Row("r1", HallSeeds.BeerTableId, 4),
                HallSteps.Row("r2", HallSeeds.RoundTableId, 2),
            ],
            chairs: 41
        );
        var lead = await ctx.Identity.ClientForAsync(HallSeeds.EventLead, ct);

        var result = await HallSteps.EventOfAsync(lead, eventId);

        Assert.Equal(new EventTablePlanDto { Tables = 6, Chairs = 41 }, result.TablePlan);
        Assert.False(result.WithoutTablePlan);
        Assert.Equal(
            EventStepState.Done,
            result.Steps.Single(status => status.Step == EventStep.Hall).State
        );
    }
}
