using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class GetActsTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetActsTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CastTodaysGroupMembersWithTheChanges_When_TheActBelongsToAGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        await CreateActAsync(
            client,
            "Gardetanz",
            ctx.Groups.Groups.IdOf(Garde),
            ActKind.Dance,
            added: [people.IdOf(Clara)],
            removed: [people.IdOf(Anna)],
            wishes: [Wish(RunningOrderRuleKind.Early, RuleStrength.Prefer)]
        );

        var (response, result) = await client.GETAsync<GetActs, GetActsRequest, GetActsResponse>(
            new()
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var act = Assert.Single(result.Acts);
        Assert.Equal("Tanzgarde", act.Group?.Name);
        Assert.Equal(["Ben", "Clara"], act.Cast.Select(person => person.FirstName));
        Assert.Equal([people.IdOf(Clara)], act.Added.Select(person => person.PersonId));
        Assert.Equal([people.IdOf(Anna)], act.Removed.Select(person => person.PersonId));
        Assert.Equal(
            [(RunningOrderRuleKind.Early, RuleStrength.Prefer)],
            act.Wishes.Select(wish => (wish.Kind, wish.Strength))
        );
    }

    [Fact]
    public async Task Should_ListTheRelevantSessionAndTheTimelessActs_When_NoSessionIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;

        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);
                await CreateActAsync(client, "Gardetanz", kind: ActKind.Dance);
                await CreateActAsync(client, "Einmarsch", kind: ActKind.Point);
                await CreateActAsync(
                    client,
                    "Neuer Tanz",
                    kind: ActKind.Dance,
                    sessionYear: RunningSessionYear + 1
                );

                var (_, result) = await client.GETAsync<GetActs, GetActsRequest, GetActsResponse>(
                    new()
                );

                Assert.Equal(RunningSessionYear, result.SessionYear);
                Assert.Equal([RunningSessionYear + 1, RunningSessionYear], result.SessionYears);
                Assert.Equal(
                    [("Einmarsch", null, false), ("Gardetanz", RunningSessionYear, false)],
                    result.Acts.Select(act => (act.Name, act.SessionYear, act.Closed))
                );
            }
        );
    }

    [Fact]
    public async Task Should_ListOnlyThatSessionsActsAsClosed_When_AnEndedSessionIsAsked()
    {
        var ct = TestContext.Current.CancellationToken;
        SeededContext? ctx = null;
        await _fixture.AtInstantAsync(
            InTheRunningSession,
            async () =>
            {
                ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
                var client = await ctx.Identity.ClientForAsync(Planner, ct);
                await CreateActAsync(client, "Gardetanz", kind: ActKind.Dance);
                await CreateActAsync(client, "Einmarsch", kind: ActKind.Point);
            }
        );

        await _fixture.AtInstantAsync(
            AfterItsAshWednesday,
            async () =>
            {
                var client = await ctx!.Identity.SignInAgainAsync(Planner, ct);
                await CreateActAsync(client, "Neuer Tanz", kind: ActKind.Dance);

                var (_, result) = await client.GETAsync<GetActs, GetActsRequest, GetActsResponse>(
                    new() { Session = RunningSessionYear }
                );

                Assert.Equal(RunningSessionYear, result.SessionYear);
                Assert.Equal([RunningSessionYear + 1, RunningSessionYear], result.SessionYears);
                var act = Assert.Single(result.Acts);
                Assert.Equal(("Gardetanz", true), (act.Name, act.Closed));
            }
        );
    }

    [Fact]
    public async Task Should_CastOnlyTheAddedPersonsAndKeepArchivedActs_When_ActsHaveNoGroup()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGala(_fixture.Today), ct);
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        await CreateActAsync(client, "Einmarsch", added: [people.IdOf(Dora), people.IdOf(Anna)]);
        var tombola = await CreateActAsync(client, "Tombola");
        await client.PUTAsync<PutActArchived, PutActArchivedRequest>(
            new() { ActId = tombola, Archived = true }
        );

        var (_, result) = await client.GETAsync<GetActs, GetActsRequest, GetActsResponse>(new());

        Assert.Equal(
            [("Einmarsch", false, "Albers Dreher"), ("Tombola", true, "")],
            result.Acts.Select(act =>
                (
                    act.Name,
                    act.Archived,
                    string.Join(" ", act.Cast.Select(person => person.LastName))
                )
            )
        );
        Assert.All(result.Acts, act => Assert.Null(act.Group));
    }

    [Fact]
    public async Task Should_ListOnlyTheActsOfHisGroups_When_AGroupAdminAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(PlannerWithGardeAdmin(_fixture.Today), ct);
        var planner = await ctx.Identity.ClientForAsync(Planner, ct);
        var groups = ctx.Groups.Groups;
        await CreateActAsync(planner, "Gardetanz", groups.IdOf(Garde));
        await CreateActAsync(planner, "Elferratsmarsch", groups.IdOf(Elferrat));
        await CreateActAsync(planner, "Tombola");
        var admin = await ctx.Identity.ClientForAsync(GardeAdmin, ct);

        var (response, result) = await admin.GETAsync<GetActs, GetActsRequest, GetActsResponse>(
            new()
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(["Gardetanz"], result.Acts.Select(act => act.Name));
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AGroupMemberWhoNeitherPlansNorLeadsAsks()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            PlannerWithGala(_fixture.Today)
                + (builder => builder.Identity(identity => identity.AddAccount(Anna))),
            ct
        );
        var member = await ctx.Identity.ClientForAsync(Anna, ct);

        var response = await member.GETAsync<GetActs, GetActsRequest, GetActsResponse>(new());

        Assert.Equal(HttpStatusCode.Forbidden, response.Response.StatusCode);
    }
}
