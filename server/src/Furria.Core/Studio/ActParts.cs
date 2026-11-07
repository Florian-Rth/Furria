using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class ActParts
{
    [Pure]
    public static PartTiling Group(StepTiling steps, IEnumerable<PartRange> parts)
    {
        var stepOrder = StepOrderOf(steps);
        var bounded = parts
            .Select(part => (part.PartId, Bounds: BoundsOf(stepOrder, part)))
            .ToList();
        var anchored = bounded
            .Where(part => part.Bounds is not null)
            .Select(part => (part.PartId, Bounds: part.Bounds!.Value))
            .OrderBy(part => part.Bounds.From)
            .ThenBy(part => part.PartId)
            .ToList();
        var (spans, crowdedOut) = SpansOf(anchored, steps.Spans);

        return new PartTiling(
            spans,
            [
                .. bounded
                    .Where(part => part.Bounds is null)
                    .Select(part => part.PartId)
                    .Concat(crowdedOut),
            ]
        );
    }

    [Pure]
    public static PartRangeRefusal? RefusalOf(StepTiling steps, PartTiling parts, PartRange range)
    {
        var stepOrder = StepOrderOf(steps);
        if (
            !stepOrder.TryGetValue(range.FirstStepId, out var from)
            || !stepOrder.TryGetValue(range.LastStepId, out var until)
        )
            return PartRangeRefusal.Adrift;
        if (from > until)
            return PartRangeRefusal.Reversed;

        return parts.Spans.Any(span =>
            span.PartId != range.PartId
            && span.StepIds.Any(stepId => stepOrder[stepId] >= from && stepOrder[stepId] <= until)
        )
            ? PartRangeRefusal.Overlapping
            : null;
    }

    [Pure]
    public static PartRange? Without(PartTiling parts, PartRange part, int removedStepId)
    {
        if (parts.Spans.FirstOrDefault(span => span.PartId == part.PartId) is not { } span)
            return AdriftWithout(part, removedStepId);

        var remaining = span.StepIds.Where(stepId => stepId != removedStepId).ToList();
        return remaining.Count == 0
            ? null
            : new PartRange(part.PartId, remaining[0], remaining[^1]);
    }

    [Pure]
    public static IReadOnlyList<PartRange> ReachingInto(
        PartTiling parts,
        int splitStepId,
        int newStepId
    ) =>
        [
            .. parts
                .Spans.Where(span => span.StepIds.Count > 0 && span.StepIds[^1] == splitStepId)
                .Select(span => new PartRange(span.PartId, span.StepIds[0], newStepId)),
        ];

    [Pure]
    private static PartRange? AdriftWithout(PartRange part, int removedStepId) =>
        (part.FirstStepId == removedStepId, part.LastStepId == removedStepId) switch
        {
            (true, true) => null,
            (true, false) => part with { FirstStepId = part.LastStepId },
            (false, true) => part with { LastStepId = part.FirstStepId },
            _ => part,
        };

    [Pure]
    private static Dictionary<int, int> StepOrderOf(StepTiling steps) =>
        steps
            .Spans.Select((span, index) => (span.StepId, index))
            .ToDictionary(step => step.StepId, step => step.index);

    [Pure]
    private static (int From, int Until)? BoundsOf(
        IReadOnlyDictionary<int, int> stepOrder,
        PartRange part
    ) =>
        stepOrder.TryGetValue(part.FirstStepId, out var first)
        && stepOrder.TryGetValue(part.LastStepId, out var last)
            ? (Math.Min(first, last), Math.Max(first, last))
            : null;

    [Pure]
    private static (List<PartSpan> Spans, List<int> CrowdedOut) SpansOf(
        IReadOnlyList<(int PartId, (int From, int Until) Bounds)> anchored,
        IReadOnlyList<StepSpan> stepSpans
    )
    {
        var spans = new List<PartSpan>();
        var crowdedOut = new List<int>();
        var nextFree = 0;
        foreach (var (partId, (from, until)) in anchored)
        {
            var start = Math.Max(from, nextFree);
            if (start > until)
            {
                crowdedOut.Add(partId);
                continue;
            }

            spans.Add(new PartSpan(partId, StepIdsBetween(stepSpans, start, until)));
            nextFree = until + 1;
        }

        return (spans, crowdedOut);
    }

    [Pure]
    private static List<int> StepIdsBetween(
        IReadOnlyList<StepSpan> stepSpans,
        int from,
        int until
    ) => [.. stepSpans.Skip(from).Take(until - from + 1).Select(span => span.StepId)];
}
