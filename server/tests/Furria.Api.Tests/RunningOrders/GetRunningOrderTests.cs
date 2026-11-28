using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.RunningOrders;
using Furria.Tests.Common;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderSeeds;
using static Furria.Api.Tests.RunningOrders.RunningOrderSteps;

namespace Furria.Api.Tests.RunningOrders;

[SeedsAliases]
public sealed class GetRunningOrderTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public GetRunningOrderTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_RecheckTheOrder_When_AnActMovedToAnotherGroupAfterSaving()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            PlannerWithGala(_fixture.Today) + SoloGroupsOf(Clara),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var clara = ctx.Identity.People.IdOf(Clara);
        var claraSolo = ctx.Groups.Groups.IdOf(SoloOf(Clara));
        var eventId = ctx.Club.Events.IdOf(Gala);
        var rede = await CreateActAsync(client, "Büttenrede", claraSolo);
        var lied = await CreateActAsync(client, "Lied");
        var saved = await SavedAsync(client, eventId, null, [Line(rede, 0), Line(lied, 1)]);
        await client.PUTAsync<PutAct, PutActRequest>(
            new()
            {
                ActId = lied,
                Name = "Lied",
                GroupId = claraSolo,
                Kind = ActKind.Music,
                SessionYear = null,
                Wishes = [],
            }
        );

        var (_, result) = await GetAsync(client, eventId);

        Assert.Empty(saved.Findings);
        var finding = Assert.Single(result.Findings);
        Assert.Equal(FindingKind.NoChangeover, finding.Kind);
        Assert.Equal([clara], finding.PersonIds);
        Assert.Equal(saved.Version, result.Version);
    }

    [Fact]
    public async Task Should_CastTheEveningAndCheckIt_When_TheAppearanceChangesTheCastForTheEvening()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            PlannerWithGala(_fixture.Today) + SoloGroupsOf(Clara),
            ct
        );
        var client = await ctx.Identity.ClientForAsync(Planner, ct);
        var people = ctx.Identity.People;
        var eventId = ctx.Club.Events.IdOf(Gala);
        var tanz = await CreateActAsync(client, "Gardetanz", ctx.Groups.Groups.IdOf(Garde));
        var rede = await CreateActAsync(
            client,
            "Büttenrede",
            ctx.Groups.Groups.IdOf(SoloOf(Clara))
        );
        await SavedAsync(client, eventId, null, [Line(tanz, 0), Line(rede, 1)]);
        await _fixture.ChangeEveningCastDirectlyAsync(
            eventId,
            tanz,
            people.IdOf(Clara),
            CastChange.Added,
            ct
        );
        await _fixture.ChangeEveningCastDirectlyAsync(
            eventId,
            tanz,
            people.IdOf(Anna),
            CastChange.Removed,
            ct
        );

        var (_, result) = await GetAsync(client, eventId);

        var dance = result.Lines.Single(line => line.Act.ActId == tanz);
        Assert.Equal([EveningChange.Cast], dance.EveningChanges);
        Assert.Equal(
            [people.IdOf(Clara), people.IdOf(Dora)],
            dance.Act.Cast.Select(person => person.PersonId)
        );
        Assert.Empty(result.Lines.Single(line => line.Act.ActId == rede).EveningChanges);
        var finding = Assert.Single(result.Findings);
        Assert.Equal(FindingKind.NoChangeover, finding.Kind);
        Assert.Equal([people.IdOf(Clara)], finding.PersonIds);
    }

    private static Task<TestResult<GetRunningOrderResponse>> GetAsync(
        HttpClient client,
        int eventId
    ) =>
        client.GETAsync<GetRunningOrder, GetRunningOrderRequest, GetRunningOrderResponse>(
            new() { EventId = eventId }
        );
}
