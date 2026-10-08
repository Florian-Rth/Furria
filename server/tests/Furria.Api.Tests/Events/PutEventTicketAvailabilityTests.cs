using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Core.Events;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class PutEventTicketAvailabilityTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";
    private const string PresaleNotBegunMessage =
        "Die Kartenlage lässt sich erst setzen, wenn der Vorverkauf begonnen hat.";

    private static readonly DateOnly JoinedIn2017 = new(2017, 9, 1);

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
    private static readonly DateTimeOffset AtTheSecondGala = new(
        2027,
        1,
        23,
        18,
        11,
        0,
        TimeSpan.Zero
    );
    private static readonly DateTimeOffset AtTheOpening = new(2027, 2, 6, 18, 0, 0, TimeSpan.Zero);
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

    public PutEventTicketAvailabilityTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_SetTheAvailability_When_ThePresaleHasBegun()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");

                var response = await SetAsync(ctx, "vera", eventId, TicketAvailability.SoldOut);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Event(eventId)
                    .ToHaveTicketAvailability(TicketAvailability.SoldOut)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePresaleStartIsStillAhead()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("second-gala");

                var response = await SetAsync(ctx, "vera", eventId, TicketAvailability.FewLeft);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                var failures = await ReadFailuresAsync(response, ct);
                Assert.Equal([PresaleNotBegunMessage], failures[ConflictField]);
                await ctx
                    .Expected.Event(eventId)
                    .ToHaveTicketAvailability(TicketAvailability.Available)
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnConflict_When_ThePresaleIsNotYetAnnounced()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("opening");

                var response = await SetAsync(ctx, "vera", eventId, TicketAvailability.SoldOut);

                Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
                var failures = await ReadFailuresAsync(response, ct);
                Assert.Equal([PresaleNotBegunMessage], failures[ConflictField]);
            }
        );
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEventIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await SetAsync(ctx, "vera", 999_999, TicketAvailability.SoldOut);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task<HttpResponseMessage> SetAsync(
        SeededContext ctx,
        string alias,
        int eventId,
        TicketAvailability availability
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.PUTAsync<PutEventTicketAvailability, PutEventTicketAvailabilityRequest>(
            new() { EventId = eventId, TicketAvailability = availability }
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
                                "1. Prunksitzung",
                                AtTheFirstGala,
                                "buergerhaus",
                                presaleStartsAt: PresaleStarted
                            )
                            .AddEvent(
                                "second-gala",
                                "2. Prunksitzung",
                                AtTheSecondGala,
                                "buergerhaus",
                                presaleStartsAt: PresaleAhead
                            )
                            .AddEvent("opening", "Kinderfasching", AtTheOpening, "buergerhaus")
                    ),
            ct
        );

    private static async Task<IDictionary<string, List<string>>> ReadFailuresAsync(
        HttpResponseMessage response,
        CancellationToken ct
    )
    {
        var payload = await response.Content.ReadFromJsonAsync<ErrorResponse>(ct);
        return payload?.Errors
            ?? throw new InvalidOperationException("The failure response carried no errors.");
    }
}
