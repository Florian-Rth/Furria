using System.Net;
using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Events;
using Furria.Application.Authorization;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Events;

public sealed class PutEventCancelledTests : IClassFixture<ApiTestFixture>
{
    private const string ConflictField = "conflict";

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
    private static readonly DateTimeOffset CancelledLastWeek = new(
        2027,
        1,
        3,
        10,
        0,
        0,
        TimeSpan.Zero
    );

    private readonly ApiTestFixture _fixture;

    public PutEventCancelledTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_StampTheCancellationAndKeepTheEvent_When_TheKeyHolderCancels()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            Now,
            async () =>
            {
                var ctx = await BuildClubAsync(ct);
                var eventId = ctx.Club.Events.IdOf("first-gala");

                var response = await SetAsync(ctx, "vera", eventId, isCancelled: true);

                Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
                await ctx
                    .Expected.Event(eventId)
                    .ToBeCancelledAt(Now)
                    .CalendarEntry(eventId)
                    .ToHaveTitle("1. Prunksitzung")
                    .AssertAsync(ct);
            }
        );
    }

    [Fact]
    public async Task Should_TakeTheCancellationBack_When_TheEventIsCancelled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("second-gala");

        var response = await SetAsync(ctx, "vera", eventId, isCancelled: false);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx.Expected.Event(eventId).ToNotBeCancelled().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheEventIsAlreadyCancelled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);
        var eventId = ctx.Club.Events.IdOf("second-gala");

        var response = await SetAsync(ctx, "vera", eventId, isCancelled: true);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Veranstaltung ist bereits abgesagt."], failures[ConflictField]);
        await ctx.Expected.Event(eventId).ToBeCancelledAt(CancelledLastWeek).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheEventIsNotCancelled()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await SetAsync(
            ctx,
            "vera",
            ctx.Club.Events.IdOf("first-gala"),
            isCancelled: false
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var failures = await ReadFailuresAsync(response, ct);
        Assert.Equal(["Diese Veranstaltung ist nicht abgesagt."], failures[ConflictField]);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_TheEventIsUnknown()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await BuildClubAsync(ct);

        var response = await SetAsync(ctx, "vera", 999_999, isCancelled: true);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static async Task<HttpResponseMessage> SetAsync(
        SeededContext ctx,
        string alias,
        int eventId,
        bool isCancelled
    )
    {
        var client = await ctx.Identity.ClientForAsync(
            alias,
            TestContext.Current.CancellationToken
        );
        return await client.PUTAsync<PutEventCancelled, PutEventCancelledRequest>(
            new() { EventId = eventId, IsCancelled = isCancelled }
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
                                "buergerhaus"
                            )
                            .AddEvent(
                                "second-gala",
                                "2. Prunksitzung",
                                AtTheSecondGala,
                                "buergerhaus",
                                cancelledAt: CancelledLastWeek
                            )
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
