using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.Club;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;
using static Furria.Api.Tests.Studio.StudioSeeds;
using static Furria.Api.Tests.Studio.StudioSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class PutRunningOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PutRunningOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheVersionIsStale()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch");
        var first = await SavedAsync(client, eventId, null, [Line(einmarsch, 0)]);
        await SavedAsync(client, eventId, first.Version, [Line(einmarsch, null)]);

        var (stale, _) = await SaveAsync(client, eventId, first.Version, [Line(einmarsch, 0)]);
        var (blind, _) = await SaveAsync(client, eventId, null, [Line(einmarsch, 0)]);

        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, blind.StatusCode);
        await ctx.Expected.RunningOrder(eventId).ToHaveVersion(2).AssertAsync(ct);
    }

    [Theory]
    [InlineData("duplicate-act", "Jeder Auftritt steht nur einmal im Ablauf.")]
    [InlineData("gap", "Die Reihenfolge hat Lücken oder doppelte Plätze.")]
    [InlineData("split-block", "Die Auftritte eines Blocks stehen direkt hintereinander.")]
    [InlineData("unplaced-block", "Jeder Auftritt eines Blocks braucht einen Platz im Ablauf.")]
    [InlineData("unplaced-pin", "Eine festgesetzte Zeile braucht einen Platz im Ablauf.")]
    [InlineData(
        "rule-subject-missing",
        "Eine Regel nennt einen Auftritt, der nicht im Ablauf steht."
    )]
    public async Task Should_RefuseTheState_When_ItBreaksTheShapeOfARunningOrder(
        string breach,
        string refusal
    )
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var a = await CreateActAsync(client, "Einmarsch");
        var b = await CreateActAsync(client, "Gardetanz");
        var c = await CreateActAsync(client, "Finale");
        IReadOnlyList<RunningOrderRuleDataDto> rules = [];
        IReadOnlyList<RunningOrderLineDataDto> lines = breach switch
        {
            "duplicate-act" => [Line(a, 0), Line(a, 1)],
            "gap" => [Line(a, 0), Line(b, 2)],
            "split-block" => [Line(a, 0, blockKey: 1), Line(b, 1), Line(c, 2, blockKey: 1)],
            "unplaced-block" => [Line(a, 0, blockKey: 1), Line(b, null, blockKey: 1)],
            "unplaced-pin" => [Line(a, 0), Line(b, null, pinned: true)],
            _ => [Line(a, 0), Line(b, 1)],
        };
        if (breach == "rule-subject-missing")
            rules = [Rule(RunningOrderRuleKind.Before, a, c)];

        var (response, _) = await SaveAsync(client, eventId, null, lines, rules);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(refusal, await RefusalOfAsync(response));
        await ctx.Expected.RunningOrder(eventId).ToNotExist().AssertAsync(ct);
    }

    [Fact]
    public async Task Should_KeepAnArchivedActButRefuseANewOne_When_TheOrderIsSaved()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var planned = await CreateActAsync(client, "Einmarsch");
        var unplanned = await CreateActAsync(client, "Tombola");
        var first = await SavedAsync(client, eventId, null, [Line(planned, 0)]);
        foreach (var actId in new[] { planned, unplanned })
            await client.PUTAsync<PutActArchived, PutActArchivedRequest>(
                new() { ActId = actId, Archived = true }
            );

        var (kept, keptResult) = await SaveAsync(
            client,
            eventId,
            first.Version,
            [Line(planned, null)]
        );
        var (added, _) = await SaveAsync(
            client,
            eventId,
            keptResult.Version,
            [Line(planned, 0), Line(unplanned, 1)]
        );

        Assert.Equal(HttpStatusCode.OK, kept.StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, added.StatusCode);
        Assert.Equal(
            "Ein archivierter Auftritt lässt sich nicht neu einplanen.",
            await RefusalOfAsync(added)
        );
    }

    [Fact]
    public async Task Should_MarkTheOrderChanged_When_ItWasConfirmedBefore()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var einmarsch = await CreateActAsync(client, "Einmarsch");
        var first = await SavedAsync(client, eventId, null, [Line(einmarsch, 0)]);
        await client.PUTAsync<
            PutRunningOrderConfirmation,
            PutRunningOrderConfirmationRequest,
            PutRunningOrderConfirmationResponse
        >(new() { EventId = eventId, Confirmed = true });

        var result = await SavedAsync(client, eventId, first.Version, [Line(einmarsch, null)]);

        Assert.NotNull(result.ConfirmedAt);
        Assert.True(result.ChangedSinceConfirmed);
    }

    [Fact]
    public async Task Should_RefuseTheAct_When_ItBelongsToAnotherSessionThanTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var eventId = ctx.Club.Events.IdOf(Gala);
        var nextSession = ClubSession.RelevantYearOf(_fixture.Today) + 1;
        var tanz = await CreateActAsync(
            client,
            "Gardetanz",
            kind: ActKind.Dance,
            sessionYear: nextSession
        );

        var (response, _) = await SaveAsync(client, eventId, null, [Line(tanz, 0)]);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal(
            "Dieser Auftritt gehört zu einer anderen Session als die Veranstaltung.",
            await RefusalOfAsync(response)
        );
    }
}
