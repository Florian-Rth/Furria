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
    public static int? HeirOf(PartTiling parts, int partId, int removedStepId) =>
        parts
            .Spans.FirstOrDefault(span => span.PartId == partId)
            ?.StepIds.Where(stepId => stepId != removedStepId)
            .Cast<int?>()
            .FirstOrDefault();

    [Pure]
    public static bool StartsAPart(PartTiling parts, int stepId) =>
        parts.Spans.Any(span => span.StepIds.Count > 0 && span.StepIds[0] == stepId);

    [Pure]
    public static PartMoveRefusal? RefusalToStartAt(
        StepTiling steps,
        PartTiling parts,
        int partId,
        int stepId
    )
    {
        var partIndex = parts.Spans.ToList().FindIndex(span => span.PartId == partId);
        var stepIndex = steps.Spans.ToList().FindIndex(span => span.StepId == stepId);
        if (partIndex < 0 || stepIndex < 0)
            return PartMoveRefusal.Adrift;
        if (partIndex == 0)
            return PartMoveRefusal.FirstPart;

        var lower = StepIndexOf(steps, parts.Spans[partIndex - 1].StepIds[0]);
        var upper =
            partIndex + 1 < parts.Spans.Count
                ? StepIndexOf(steps, parts.Spans[partIndex + 1].StepIds[0])
                : steps.Spans.Count;

        return stepIndex > lower && stepIndex < upper ? null : PartMoveRefusal.BeyondANeighbour;
    }

    [Pure]
    private static int StepIndexOf(StepTiling steps, int stepId) =>
        steps.Spans.ToList().FindIndex(span => span.StepId == stepId);

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
