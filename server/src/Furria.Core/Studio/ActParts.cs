using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class ActParts
{
    [Pure]
    public static PartTiling Tile(StepTiling steps, IEnumerable<PartStart> parts)
    {
        var stepOrder = steps
            .Spans.Select((span, index) => (span.StepId, index))
            .ToDictionary(step => step.StepId, step => step.index);
        var partList = parts.ToList();
        var anchored = partList
            .Where(part => stepOrder.ContainsKey(part.FirstStepId))
            .OrderBy(part => stepOrder[part.FirstStepId])
            .ToList();

        return new PartTiling(
            SpansOf(anchored, stepOrder, steps.Spans),
            [
                .. partList
                    .Where(part => !stepOrder.ContainsKey(part.FirstStepId))
                    .Select(part => part.PartId),
            ]
        );
    }

    [Pure]
    private static List<PartSpan> SpansOf(
        IReadOnlyList<PartStart> anchored,
        IReadOnlyDictionary<int, int> stepOrder,
        IReadOnlyList<StepSpan> stepSpans
    ) =>
        [
            .. anchored.Select(
                (part, index) =>
                    new PartSpan(
                        part.PartId,
                        StepIdsBetween(
                            stepSpans,
                            index == 0 ? 0 : stepOrder[part.FirstStepId],
                            index + 1 < anchored.Count
                                ? stepOrder[anchored[index + 1].FirstStepId]
                                : stepSpans.Count
                        )
                    )
            ),
        ];

    [Pure]
    private static List<int> StepIdsBetween(
        IReadOnlyList<StepSpan> stepSpans,
        int from,
        int until
    ) => [.. stepSpans.Skip(from).Take(until - from).Select(span => span.StepId)];
}
