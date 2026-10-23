using Furria.Core.RunningOrders;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderPlanningFixtures;

namespace Furria.Api.Tests.RunningOrders;

public sealed class RunningOrderCostPipelineTests
{
    [Fact]
    public void Should_CostAConflict_When_NeighboursShareAPerson()
    {
        var costs = CostsOf([Nummer(1, 0, Anna), Nummer(2, 1, Anna), Nummer(3, 2)]);

        Assert.Equal(1000, costs[RunningOrderCostStep.NoChangeover]);
        Assert.Equal(1000, costs.Values.Sum());
    }

    [Fact]
    public void Should_CostAHint_When_APersonHasOnlyOneNummerToChange()
    {
        var costs = CostsOf([Nummer(1, 0, Anna), Nummer(2, 1), Nummer(3, 2, Anna)]);

        Assert.Equal(10, costs[RunningOrderCostStep.TightChangeover]);
        Assert.Equal(10, costs.Values.Sum());
    }

    [Fact]
    public void Should_CostAConflict_When_AMustRuleIsBroken()
    {
        var costs = CostsOf(
            [Nummer(1, 0), Nummer(2, 1)],
            [Rule(RunningOrderRuleKind.Last, RuleStrength.Must, 1)]
        );

        Assert.Equal(1000, costs[RunningOrderCostStep.MustRules]);
    }

    [Fact]
    public void Should_CostAHint_When_APreferRuleIsMissed()
    {
        var costs = CostsOf(
            [Nummer(1, 0), Nummer(2, 1)],
            [Rule(RunningOrderRuleKind.First, RuleStrength.Prefer, 2)]
        );

        Assert.Equal(10, costs[RunningOrderCostStep.PreferRules]);
        Assert.Equal(0, costs[RunningOrderCostStep.MustRules]);
    }

    [Fact]
    public void Should_CostAHint_When_TwoSpeechesFollowEachOther()
    {
        var costs = CostsOf([Speech(1, 0), Speech(2, 1), Nummer(3, 2)]);

        Assert.Equal(10, costs[RunningOrderCostStep.SameKind]);
    }

    [Fact]
    public void Should_CostAHint_When_ANummerIsLeftUnplaced()
    {
        var costs = CostsOf([Nummer(1, 0), Nummer(2, null)]);

        Assert.Equal(10, costs[RunningOrderCostStep.Unplaced]);
    }

    [Fact]
    public void Should_CostLessRoomTheMoreAuftritteLieBetween_When_APersonAppearsAgain()
    {
        var costs = CostsOf([
            Nummer(1, 0, Anna, Ben),
            Nummer(2, 1),
            Nummer(3, 2),
            Nummer(4, 3, Anna),
            Nummer(5, 4),
            Nummer(6, 5, Ben),
            Nummer(7, 6),
            Nummer(8, 7, Anna),
            Nummer(9, 8),
            Nummer(10, 9),
            Nummer(11, 10),
            Nummer(12, 11),
            Nummer(13, 12),
            Nummer(14, 13, Anna),
            Nummer(15, 14) with
            {
                Cast = [new ReviewCastMember(Ben, true)],
            },
        ]);

        Assert.Equal(4 + 2 + 0 + 1, costs[RunningOrderCostStep.ChangeoverRoom]);
        Assert.Equal(
            0,
            costs
                .Where(cost => cost.Key != RunningOrderCostStep.ChangeoverRoom)
                .Sum(cost => cost.Value)
        );
    }

    [Fact]
    public void Should_AppendToTheCompleteCost_When_AnyOrderOfTheEveningIsBuiltLineByLine()
    {
        var evening = RuleRichEvening();
        var pipeline = PipelineOf(evening, RuleRichRules());
        var keys = evening.Select(line => line.Key).ToList();

        foreach (var order in PermutationsOf(keys))
            Assert.Equal(pipeline.CostsOf(order), pipeline.AppendedCostsOf(order));
    }

    private static IReadOnlyDictionary<RunningOrderCostStep, int> CostsOf(
        IReadOnlyList<ReviewLine> lines,
        IReadOnlyList<ReviewRule>? rules = null
    ) =>
        PipelineOf(lines, rules)
            .CostsOf([.. PlacedKeysOf(lines)])
            .ToDictionary(cost => cost.Step, cost => cost.Cost);

    private static RunningOrderCostPipeline PipelineOf(
        IReadOnlyList<ReviewLine> lines,
        IReadOnlyList<ReviewRule>? rules = null
    ) => RunningOrderCostPipeline.For(new() { Lines = lines, Rules = rules ?? [] });

    private static IEnumerable<LineKey> PlacedKeysOf(IReadOnlyList<ReviewLine> lines) =>
        lines
            .Where(line => line.Position is not null)
            .OrderBy(line => line.Position)
            .Select(line => line.Key);
}
