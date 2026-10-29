using System.Diagnostics.Contracts;
using Furria.Core.RunningOrders.Planning;

namespace Furria.Core.RunningOrders;

public sealed class RunningOrderCostPipeline
{
    private readonly RunningOrderReviewInput _input;
    private readonly ICostStep[] _primarySteps;
    private readonly ChangeoverRoomStep _roomStep;
    private readonly ICostStep[] _steps;

    internal PlanFacts Facts { get; }

    private RunningOrderCostPipeline(RunningOrderReviewInput input)
    {
        _input = input;
        Facts = new PlanFacts(input);
        _primarySteps =
        [
            new NoChangeoverStep(),
            new TightChangeoverStep(),
            RuleStep.Must(),
            RuleStep.Prefer(),
            new SameKindStep(),
            new UnplacedStep(),
        ];
        _roomStep = new ChangeoverRoomStep();
        _steps = [.. _primarySteps, _roomStep];
    }

    [Pure]
    public static RunningOrderCostPipeline For(RunningOrderReviewInput input) => new(input);

    [Pure]
    public IReadOnlyList<StepCost> CostsOf(IReadOnlyList<LineKey> order)
    {
        var complete = new CompleteOrder(order, FindingsOf(order), Facts);

        return
        [
            .. _steps.Select(step => new StepCost(
                step.Step,
                step.ViolationsOf(complete) * step.Weight
            )),
        ];
    }

    [Pure]
    public IReadOnlyList<StepCost> AppendedCostsOf(IReadOnlyList<LineKey> order)
    {
        var partial = new PartialOrder(Facts);
        var costs = _steps.Select(step => step.BaseViolations(Facts) * step.Weight).ToArray();
        foreach (var key in order)
        {
            partial.Push(Facts.LineOf(key));
            for (var index = 0; index < _steps.Length; index++)
                costs[index] += CostAddedBy(_steps[index], partial);
        }

        return [.. _steps.Select((step, index) => new StepCost(step.Step, costs[index]))];
    }

    [Pure]
    public IReadOnlyList<RunningOrderFinding> FindingsOf(IReadOnlyList<LineKey> order)
    {
        var positions = order
            .Select((key, index) => (key, index))
            .ToDictionary(pair => pair.key, pair => pair.index);

        return RunningOrderReview.FindingsOf(
            _input with
            {
                Lines =
                [
                    .. _input.Lines.Select(line =>
                        line with
                        {
                            Position = positions.TryGetValue(line.Key, out var position)
                                ? position
                                : null,
                        }
                    ),
                ],
            }
        );
    }

    [Pure]
    internal long BaseCost() =>
        LexicographicCost.Of(
            _primarySteps.Sum(step => step.BaseViolations(Facts) * step.Weight),
            _roomStep.BaseViolations(Facts)
        );

    [Pure]
    internal long CostAddedByLastLine(PartialOrder partial, bool isRoomCounted)
    {
        var primary = 0;
        foreach (var step in _primarySteps)
            primary += CostAddedBy(step, partial);

        return LexicographicCost.Of(primary, isRoomCounted ? CostAddedBy(_roomStep, partial) : 0);
    }

    [Pure]
    internal int RuleCostCertainAhead(PartialOrder partial)
    {
        var cost = 0;
        foreach (var rule in Facts.SubjectRules)
        {
            if (RuleVerdicts.IsCertainToBreak(rule, partial, Facts))
                cost +=
                    rule.Strength == RuleStrength.Must ? CostWeights.Conflict : CostWeights.Hint;
        }

        return cost;
    }

    [Pure]
    private int CostAddedBy(ICostStep step, PartialOrder partial) =>
        step.ViolationsAddedByLastLine(partial, Facts) * step.Weight;
}
