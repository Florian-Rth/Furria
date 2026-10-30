using Furria.Core.RunningOrders;
using Xunit;
using static Furria.Api.Tests.RunningOrders.RunningOrderPlanningFixtures;

namespace Furria.Api.Tests.RunningOrders;

public sealed class RunningOrderSuggestionTests
{
    private const int Garde = 1;
    private const int Rede = 2;
    private const int Showtanz = 3;
    private const int Buett = 4;
    private const int Finale = 5;

    private static readonly IReadOnlyDictionary<
        string,
        RunningOrderReviewInput
    > SmallEveningsByName = new Dictionary<string, RunningOrderReviewInput>
    {
        ["pinned"] = new()
        {
            Lines =
            [
                Nummer(1, 0, Anna),
                Nummer(2, 1, Anna, Ben),
                Nummer(3, 2, Ben) with
                {
                    IsPinned = true,
                },
                Nummer(4, 3, Carl),
                Nummer(5, 4, Carl, Anna),
                Nummer(6, 5, Dora),
            ],
            Rules = [],
        },
        ["blockAndHalves"] = new()
        {
            Lines =
            [
                Nummer(1, 0, Anna) with
                {
                    BlockKey = 1,
                },
                Nummer(2, 1, Ben) with
                {
                    BlockKey = 1,
                },
                Nummer(3, 2, Ben),
                Nummer(4, 3, Anna),
                Nummer(5, 4, Carl),
                Nummer(6, 5, Carl),
            ],
            Rules =
            [
                Rule(RunningOrderRuleKind.SecondHalf, RuleStrength.Must, 1),
                Rule(RunningOrderRuleKind.FirstHalf, RuleStrength.Prefer, 6),
                Rule(RunningOrderRuleKind.Late, RuleStrength.Must, 5),
            ],
        },
        ["thirdsAndTray"] = new()
        {
            Lines =
            [
                Speech(1, 0, Anna),
                Speech(2, 1, Ben),
                Nummer(3, 2, Ben),
                Nummer(4, 3, Carl),
                Nummer(5, 4),
                Nummer(6, null, Carl),
                Nummer(7, null, Dora),
            ],
            Rules =
            [
                Rule(RunningOrderRuleKind.Early, RuleStrength.Must, 7),
                Rule(RunningOrderRuleKind.Late, RuleStrength.Prefer, 1),
                Rule(RunningOrderRuleKind.Apart, RuleStrength.Must, 3, 4),
                Rule(RunningOrderRuleKind.Before, RuleStrength.Prefer, 5, 2),
                Rule(RunningOrderRuleKind.Last, RuleStrength.Must, 6),
            ],
        },
        ["ruleRich"] = new() { Lines = RuleRichEvening(), Rules = RuleRichRules() },
        ["crowded"] = new()
        {
            Lines =
            [
                Nummer(1, 0, Anna, Ben),
                Nummer(2, 1, Anna),
                Nummer(3, 2, Ben, Carl),
                Nummer(4, 3, Carl),
                Nummer(5, 4, Anna, Dora),
                Nummer(6, 5, Dora) with
                {
                    IsPinned = true,
                },
                Nummer(7, 6, Ben),
                Nummer(8, null, Carl, Dora),
            ],
            Rules = [Rule(RunningOrderRuleKind.Late, RuleStrength.Prefer, 2)],
        },
    };

    public static TheoryData<string> SmallEvenings => [.. SmallEveningsByName.Keys];

    [Fact]
    public void Should_ResolveTheConflict_When_NeighboursShareAPerson()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna),
            Nummer(Showtanz, 1, Anna),
            Nummer(Rede, 2),
            Nummer(Buett, 3),
            Nummer(Finale, 4),
        ]);

        Assert.Equal(
            (1, 0, 0),
            (proposal.ConflictsBefore, proposal.ConflictsAfter, proposal.HintsAfter)
        );
        Assert.Equal(0, proposal.CostAfter);
        Assert.True(proposal.Proven);
        Assert.Contains(
            proposal.Moves.SelectMany(move => move.Resolved),
            resolved =>
                resolved.Kind == FindingKind.NoChangeover
                && resolved.Lines.SequenceEqual([Act(Garde), Act(Showtanz)])
        );
        Assert.All(
            proposal.Moves,
            move => Assert.Equal(move.To, proposal.Order.ToList().IndexOf(move.Line))
        );
    }

    [Fact]
    public void Should_NeverMoveAPinnedLine_When_ItSharesAPersonWithItsNeighbour()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna) with
            {
                IsPinned = true,
            },
            Nummer(Showtanz, 1, Anna) with
            {
                IsPinned = true,
            },
            Nummer(Rede, 2, Ben),
            Nummer(Buett, 3, Ben),
            Nummer(Finale, 4),
        ]);

        Assert.Equal(1, proposal.ConflictsAfter);
        Assert.Equal([Act(Garde), Act(Showtanz)], proposal.Order.Take(2));
        Assert.DoesNotContain(
            proposal.Moves,
            move => move.Line == Act(Garde) || move.Line == Act(Showtanz)
        );
    }

    [Fact]
    public void Should_KeepABlockContiguous_When_TheBlockIsMoved()
    {
        var proposal = ProposalFor(
            [
                Nummer(Garde, 0, Anna) with
                {
                    BlockKey = 1,
                },
                Nummer(Showtanz, 1) with
                {
                    BlockKey = 1,
                },
                Nummer(Rede, 2, Anna),
                Nummer(Buett, 3),
                Nummer(Finale, 4),
            ],
            [Rule(RunningOrderRuleKind.Last, RuleStrength.Must, Showtanz)]
        );

        Assert.Equal(0, proposal.ConflictsAfter);
        var garde = proposal.Order.ToList().IndexOf(Act(Garde));
        Assert.Equal(Act(Showtanz), proposal.Order[garde + 1]);
    }

    [Fact]
    public void Should_ProposeNoMoves_When_TheOrderIsAlreadyOptimal()
    {
        IReadOnlyList<ReviewLine> lines =
        [
            Nummer(Garde, 0, Anna),
            Nummer(Rede, 1),
            Nummer(Showtanz, 2),
            Nummer(Buett, 3, Anna),
        ];

        var proposal = ProposalFor(lines);

        Assert.Empty(proposal.Moves);
        Assert.Equal(lines.Select(line => line.Key), proposal.Order);
        Assert.Equal((proposal.CostBefore, true), (proposal.CostAfter, proposal.Proven));
    }

    [Fact]
    public void Should_PlaceAnUnplacedNummerWhereItAvoidsAConflict_When_ItIsStillInTheTray()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna),
            Nummer(Rede, 1),
            Nummer(Showtanz, 2),
            Nummer(Buett, null, Anna),
        ]);

        Assert.Equal([Act(Garde), Act(Rede), Act(Showtanz), Act(Buett)], proposal.Order);
        Assert.Equal((0, 0), (proposal.ConflictsAfter, proposal.HintsAfter));
        var move = Assert.Single(proposal.Moves);
        Assert.Equal((Act(Buett), null, 3), (move.Line, move.From, move.To));
        Assert.Contains(move.Resolved, resolved => resolved.Kind == FindingKind.Unplaced);
    }

    [Fact]
    public void Should_PlanTheWholeEveningWithoutConflicts_When_ItIsMessyAndPartlyUnplaced()
    {
        var proposal = ProposalFor(MessyEvening());

        Assert.Equal(6, proposal.ConflictsBefore);
        Assert.Equal(0, proposal.ConflictsAfter);
        Assert.Equal(12, proposal.Order.Count);
        Assert.Equal(3, proposal.Moves.Count(move => move.From is null));
        Assert.True(proposal.Proven);
    }

    [Fact]
    public void Should_KeepThePinnedLineInPlace_When_TheWholeEveningIsPlanned()
    {
        var pinned = Act(15);

        var proposal = ProposalFor([
            .. MessyEvening()
                .Select(line => line.Key == pinned ? line with { IsPinned = true } : line),
        ]);

        Assert.Equal(0, proposal.ConflictsAfter);
        Assert.Equal(pinned, proposal.Order[2]);
        Assert.DoesNotContain(proposal.Moves, move => move.Line == pinned);
    }

    [Fact]
    public void Should_KeepTheBlockContiguous_When_TheWholeEveningIsPlanned()
    {
        var proposal = ProposalFor([
            .. MessyEvening()
                .Select(line =>
                    line.Key == Act(16) || line.Key == Act(17) ? line with { BlockKey = 1 } : line
                ),
        ]);

        Assert.Equal(0, proposal.ConflictsAfter);
        var first = proposal.Order.ToList().IndexOf(Act(16));
        Assert.Equal(Act(17), proposal.Order[first + 1]);
    }

    [Fact]
    public void Should_ProposeTheSameOrder_When_TheSameEveningWasDraggedIntoADifferentOrder()
    {
        var evening = MessyEvening();
        var placedCount = evening.Count(line => line.Position is not null);
        var dragged = evening
            .Select(line =>
                line.Position is { } position
                    ? line with
                    {
                        Position = placedCount - 1 - position,
                    }
                    : line
            )
            .Select(line => line.Key == Act(19) ? line with { Position = null } : line)
            .Select(line =>
                line.Key == Act(22) ? line with { Position = placedCount - 1 - 7 } : line
            )
            .ToList();

        var original = ProposalFor(evening);
        var redragged = ProposalFor(dragged);

        Assert.True(original.Proven && redragged.Proven);
        Assert.Equal(original.Order, redragged.Order);
    }

    [Theory]
    [MemberData(nameof(SmallEvenings))]
    public void Should_FindTheCheapestOrderWithTheLowestActIds_When_ComparedWithEveryPermutation(
        string name
    )
    {
        var input = SmallEveningsByName[name];

        var proposal = RunningOrderSuggestion.ProposalFor(input);

        Assert.True(proposal.Proven);
        Assert.Equal(CanonicalCheapestByBruteForce(input), proposal.Order);
        Assert.Equal(
            (proposal.CostAfter, proposal.RoomAfter),
            PrimaryAndRoomOf([
                .. proposal.Steps.Select(step => new StepCost(step.Step, step.After)),
            ])
        );
    }

    [Fact]
    public void Should_GiveMoreTimeToChange_When_TwoOrdersAreOtherwiseEquallyGood()
    {
        var proposal = ProposalFor([
            Nummer(1, 0, Anna),
            Nummer(2, 1),
            Nummer(3, 2),
            Nummer(4, 3, Anna),
            Nummer(5, 4),
            Nummer(6, 5),
            Nummer(7, 6),
        ]);

        Assert.Equal([Act(1), Act(2), Act(3), Act(5), Act(6), Act(7), Act(4)], proposal.Order);
        Assert.Equal((4, 0), (proposal.RoomBefore, proposal.RoomAfter));
        Assert.Equal((0, 0), (proposal.CostBefore, proposal.CostAfter));
        Assert.Contains(
            proposal.Steps,
            step => step is { Step: RunningOrderCostStep.ChangeoverRoom, Before: 4, After: 0 }
        );
        Assert.True(proposal.Proven);
    }

    [Fact]
    public void Should_KeepAWish_When_MoreTimeToChangeWouldMissIt()
    {
        var proposal = ProposalFor(
            [
                Nummer(1, 0, Anna),
                Nummer(2, 1),
                Nummer(3, 2),
                Nummer(4, 3, Anna),
                Nummer(5, 4),
                Nummer(6, 5),
                Nummer(7, 6),
                Nummer(8, 7),
                Nummer(9, 8),
                Nummer(10, 9),
                Nummer(11, 10),
                Nummer(12, 11),
            ],
            [
                Rule(RunningOrderRuleKind.First, RuleStrength.Prefer, 1),
                Rule(RunningOrderRuleKind.Early, RuleStrength.Prefer, 4),
            ]
        );

        Assert.Equal((0, 4), (proposal.HintsAfter, proposal.RoomAfter));
        Assert.Equal([Act(1), Act(2), Act(3), Act(4)], proposal.Order.Take(4));
    }

    [Fact]
    public void Should_AcceptLessTimeToChange_When_MoreWouldCostATightChangeover()
    {
        var proposal = ProposalFor([
            Nummer(1, 0, Anna),
            Nummer(2, 1, Anna),
            Nummer(3, 2, Ben),
            Nummer(4, 3, Ben),
            Nummer(5, 4, Carl),
            Nummer(6, 5, Carl),
        ]);

        Assert.Equal((0, 0), (proposal.ConflictsAfter, proposal.HintsAfter));
        Assert.Equal(12, proposal.RoomAfter);
    }

    [Fact]
    public void Should_NameThePeopleWhoGainTimeToChange_When_ALineMoves()
    {
        var proposal = ProposalFor([
            Nummer(1, 0, Anna, Ben),
            Nummer(2, 1),
            Nummer(3, 2),
            Nummer(4, 3, Anna, Carl),
            Nummer(5, 4, Ben),
            Nummer(6, 5),
            Nummer(7, 6),
            Nummer(8, 7),
        ]);

        var moved = Assert.Single(proposal.Moves, move => move.Line == Act(4));
        Assert.Equal([Anna], moved.RoomFor);
    }

    [Fact]
    public void Should_NamePinsThatHoldAConflict_When_UnpinningThemWouldResolveIt()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna) with
            {
                IsPinned = true,
            },
            Nummer(Rede, 1, Anna) with
            {
                IsPinned = true,
            },
            Nummer(Showtanz, 2),
            Nummer(Buett, 3),
        ]);

        Assert.Equal(1, proposal.ConflictsAfter);
        Assert.Equal(
            [(RunningOrderHoldKind.Pin, Act(Garde), 0), (RunningOrderHoldKind.Pin, Act(Rede), 0)],
            proposal.Holds.Select(hold => (hold.Kind, hold.Line!.Value, hold.ConflictsWithout))
        );
        Assert.False(proposal.HoldsUnavoidable);
    }

    [Fact]
    public void Should_NameTheBlockThatHoldsAConflict_When_DissolvingItWouldResolveIt()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna) with
            {
                BlockKey = 7,
            },
            Nummer(Rede, 1, Anna) with
            {
                BlockKey = 7,
            },
            Nummer(Showtanz, 2),
            Nummer(Buett, 3),
        ]);

        var hold = Assert.Single(proposal.Holds);
        Assert.Equal(
            (RunningOrderHoldKind.Block, Act(Garde), 7, 0),
            (hold.Kind, hold.Line, hold.BlockKey, hold.ConflictsWithout)
        );
    }

    [Fact]
    public void Should_NameMustRulesAndWishesThatHoldAConflict_When_TheyCannotAllBeKept()
    {
        var wish = Rule(RunningOrderRuleKind.First, RuleStrength.Must, Rede) with
        {
            RuleId = null,
            ActWishId = 77,
        };
        var rule = Rule(RunningOrderRuleKind.First, RuleStrength.Must, Garde);

        var proposal = ProposalFor(
            [Nummer(Garde, 0), Nummer(Rede, 1), Nummer(Showtanz, 2)],
            [wish, Rule(RunningOrderRuleKind.Last, RuleStrength.Prefer, Showtanz), rule]
        );

        Assert.Equal(1, proposal.ConflictsAfter);
        Assert.Equal(
            [
                (RunningOrderHoldKind.MustRule, 1, (int?)null, 0),
                (RunningOrderHoldKind.MustWish, null, 77, 0),
            ],
            proposal.Holds.Select(hold =>
                (hold.Kind, hold.RuleIndex, hold.ActWishId, hold.ConflictsWithout)
            )
        );
    }

    [Fact]
    public void Should_CallTheConflictUnavoidable_When_OnePersonIsInTooManyAuftritte()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna),
            Nummer(Buett, 1) with
            {
                IsPinned = true,
            },
            Nummer(Rede, 2, Anna),
            Nummer(Showtanz, 3, Anna),
        ]);

        Assert.Equal(1, proposal.ConflictsAfter);
        Assert.Empty(proposal.Holds);
        Assert.True(proposal.HoldsUnavoidable);
    }

    [Fact]
    public void Should_NameNoHolds_When_TheBestOrderHasNoConflict()
    {
        var proposal = ProposalFor([
            Nummer(Garde, 0, Anna) with
            {
                IsPinned = true,
            },
            Nummer(Rede, 1),
            Nummer(Showtanz, 2, Anna),
        ]);

        Assert.Equal(0, proposal.ConflictsAfter);
        Assert.Empty(proposal.Holds);
        Assert.False(proposal.HoldsUnavoidable);
    }

    [Fact]
    public void Should_ProveTheBestOrder_When_ARealisticEveningHasTwentyFiveLines()
    {
        var proposal = RunningOrderSuggestion.ProposalFor(RealisticEvening());

        Assert.True(proposal.Proven);
        Assert.Equal((1, 0), (proposal.ConflictsBefore, proposal.ConflictsAfter));
        Assert.Equal(0, proposal.HintsAfter);
        Assert.Equal(25, proposal.Order.Count);
        Assert.Equal(Act(1), proposal.Order[0]);
    }

    [Fact]
    public void Should_ReturnTheBestOrderFoundUnproven_When_TheSearchBudgetRunsOut()
    {
        var proposal = RunningOrderSuggestion.ProposalFor(
            new() { Lines = MessyEvening(), Rules = [] },
            nodeBudget: 5
        );

        Assert.False(proposal.Proven);
        Assert.Equal(12, proposal.Order.Count);
        Assert.True(proposal.CostAfter < proposal.CostBefore);
    }

    [Fact]
    public void Should_ReportEachCheaperOrderAsItIsFound_When_TheSearchRuns()
    {
        var found = new List<RunningOrderProposal>();

        var proposal = RunningOrderSuggestion.ProposalFor(
            new() { Lines = MessyEvening(), Rules = [] },
            new SuggestionSearch { Improved = found.Add }
        );

        Assert.NotEmpty(found);
        Assert.All(found, interim => Assert.False(interim.Proven));
        Assert.True(
            found.Zip(found.Skip(1)).All(pair => pair.Second.CostAfter <= pair.First.CostAfter)
        );
        Assert.Equal(proposal.Order, found[^1].Order);
        Assert.True(proposal.Proven);
    }

    [Fact]
    public void Should_HandBackTheBestOrderSoFarUnproven_When_TheSearchIsStopped()
    {
        var proposal = RunningOrderSuggestion.ProposalFor(
            new() { Lines = MessyEvening(), Rules = [] },
            new SuggestionSearch { Stop = new CancellationToken(canceled: true) }
        );

        Assert.False(proposal.Proven);
        Assert.Equal(12, proposal.Order.Count);
        Assert.True(proposal.CostAfter < proposal.CostBefore);
        Assert.Empty(proposal.Holds);
        Assert.False(proposal.HoldsUnavoidable);
    }

    [Fact]
    public void Should_GoOnFromTheSeed_When_AnEarlierSearchFoundACheaperOrder()
    {
        var input = new RunningOrderReviewInput { Lines = MessyEvening(), Rules = [] };
        var best = RunningOrderSuggestion.ProposalFor(input);

        var proposal = RunningOrderSuggestion.ProposalFor(
            input,
            new SuggestionSearch { Seed = best.Order, Stop = new CancellationToken(canceled: true) }
        );

        Assert.Equal(best.Order, proposal.Order);
        Assert.Equal((best.CostBefore, best.CostAfter), (proposal.CostBefore, proposal.CostAfter));
    }

    private static RunningOrderProposal ProposalFor(
        IReadOnlyList<ReviewLine> lines,
        IReadOnlyList<ReviewRule>? rules = null
    ) => RunningOrderSuggestion.ProposalFor(new() { Lines = lines, Rules = rules ?? [] });

    private static IReadOnlyList<LineKey> CanonicalCheapestByBruteForce(
        RunningOrderReviewInput input
    )
    {
        var pipeline = RunningOrderCostPipeline.For(input);
        return PermutationsOf([.. input.Lines.Select(line => line.Key).OrderBy(key => key.ActId)])
            .Where(order => KeepsPinsAndBlocks(order, input.Lines))
            .MinBy(order => PrimaryAndRoomOf(pipeline.CostsOf(order)))!;
    }

    private static (int Primary, int Room) PrimaryAndRoomOf(IReadOnlyList<StepCost> costs) =>
        (
            costs
                .Where(cost => cost.Step != RunningOrderCostStep.ChangeoverRoom)
                .Sum(cost => cost.Cost),
            costs.Single(cost => cost.Step == RunningOrderCostStep.ChangeoverRoom).Cost
        );

    private static bool KeepsPinsAndBlocks(
        IReadOnlyList<LineKey> order,
        IReadOnlyList<ReviewLine> lines
    )
    {
        var positions = order
            .Select((key, index) => (key, index))
            .ToDictionary(pair => pair.key, pair => pair.index);
        var placed = lines
            .Where(line => line.Position is not null)
            .OrderBy(line => line.Position)
            .ToList();

        return lines.Where(line => line.IsPinned).All(line => positions[line.Key] == line.Position)
            && placed
                .Zip(placed.Skip(1))
                .Where(pair =>
                    pair.First.BlockKey is not null && pair.First.BlockKey == pair.Second.BlockKey
                )
                .All(pair => positions[pair.Second.Key] == positions[pair.First.Key] + 1);
    }

    internal static IReadOnlyList<ReviewLine> MessyEvening() =>
        [
            Nummer(11, 0, Anna),
            Nummer(13, 1, Anna),
            Nummer(15, 2, Anna),
            Nummer(12, 3, Ben),
            Nummer(14, 4, Ben),
            Nummer(16, 5, Ben),
            Nummer(17, 6, Carl),
            Nummer(19, 7, Carl),
            Nummer(21, 8, Carl),
            Nummer(18, null, Dora),
            Nummer(20, null, Dora),
            Nummer(22, null, Dora),
        ];

    internal static RunningOrderReviewInput RealisticEvening()
    {
        var order = Enumerable.Range(1, 23).ToList();
        (order[3], order[4]) = (order[4], order[3]);
        (order[10], order[16]) = (order[16], order[10]);
        var placed = order.Select((actId, index) => EveningAct(actId, index));

        return new()
        {
            Lines = [.. placed, EveningAct(24, null), EveningAct(25, null)],
            Rules =
            [
                Rule(RunningOrderRuleKind.First, RuleStrength.Must, 1),
                Rule(RunningOrderRuleKind.Last, RuleStrength.Prefer, 25),
                Rule(RunningOrderRuleKind.SecondHalf, RuleStrength.Must, 3),
                Rule(RunningOrderRuleKind.Early, RuleStrength.Prefer, 20),
            ],
        };
    }

    private static ReviewLine EveningAct(int actId, int? position)
    {
        var group = actId % 6;
        var line = actId % 5 == 0 ? Speech(actId, position) : Nummer(actId, position);

        return line with
        {
            Cast =
            [
                new ReviewCastMember(group * 10 + 1, false),
                new ReviewCastMember(group * 10 + 2, false),
                new ReviewCastMember(1000 + actId % 4, false),
            ],
        };
    }
}
