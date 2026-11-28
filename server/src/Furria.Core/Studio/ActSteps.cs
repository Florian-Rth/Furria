using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class ActSteps
{
    private const double BorderToleranceSeconds = 0.01;

    [Pure]
    public static StepTiling Tile(IEnumerable<StepAnchors> steps, ActMusic music)
    {
        var located = steps
            .Select(step => new LocatedStep(
                step.StepId,
                music.Locate(step.Start).TimelineSeconds,
                music.LocateEnd(step.End).TimelineSeconds
            ))
            .ToList();
        var spans = SpansOf(located);
        var placed = spans.Select(span => span.StepId).ToHashSet();

        return new StepTiling(
            spans,
            [.. located.Where(step => !placed.Contains(step.StepId)).Select(step => step.StepId)]
        );
    }

    [Pure]
    public static StepCreation Create(
        StepTiling tiling,
        double startSeconds,
        double endSeconds,
        ActMusic music
    )
    {
        if (!IsInsideTheMusic(startSeconds, endSeconds, music))
            return StepCreation.Refused(StepRefusal.OutsideTheMusic);
        if (endSeconds - startSeconds < BorderToleranceSeconds)
            return StepCreation.Refused(StepRefusal.TooShort);
        if (music.AnchorAt(startSeconds) is not { } start)
            return StepCreation.Refused(StepRefusal.OutsideTheMusic);
        if (TailOf(tiling, startSeconds, endSeconds) is { } split)
            return music.EndAnchorAt(startSeconds) is { } newEnd
                ? StepCreation.Splitting(new StepSplit(split.StepId, newEnd), start)
                : StepCreation.Refused(StepRefusal.OutsideTheMusic);
        if (Overlaps(tiling, startSeconds, endSeconds))
            return StepCreation.Refused(StepRefusal.OverlapsAStep);

        return music.EndAnchorAt(Math.Min(endSeconds, music.LengthSeconds)) is { } end
            ? StepCreation.Fresh(start, end)
            : StepCreation.Refused(StepRefusal.OutsideTheMusic);
    }

    [Pure]
    public static StepBorderMove MoveStart(
        StepTiling tiling,
        int stepId,
        double timelineSeconds,
        ActMusic music
    )
    {
        var index = IndexOf(tiling, stepId);
        if (index < 0)
            return StepBorderMove.Refused(StepRefusal.Adrift);
        if (timelineSeconds < 0 || timelineSeconds >= music.LengthSeconds)
            return StepBorderMove.Refused(StepRefusal.OutsideTheMusic);
        if (tiling.Spans[index].EndSeconds - timelineSeconds < BorderToleranceSeconds)
            return StepBorderMove.Refused(StepRefusal.TooShort);
        if (
            index > 0
            && timelineSeconds < tiling.Spans[index - 1].EndSeconds - BorderToleranceSeconds
        )
            return StepBorderMove.Refused(StepRefusal.OverlapsAStep);

        return music.AnchorAt(timelineSeconds) is { } start
            ? StepBorderMove.To(start)
            : StepBorderMove.Refused(StepRefusal.OutsideTheMusic);
    }

    [Pure]
    public static StepBorderMove MoveEnd(
        StepTiling tiling,
        int stepId,
        double timelineSeconds,
        ActMusic music
    )
    {
        var index = IndexOf(tiling, stepId);
        if (index < 0)
            return StepBorderMove.Refused(StepRefusal.Adrift);
        if (timelineSeconds <= 0 || timelineSeconds > music.LengthSeconds + BorderToleranceSeconds)
            return StepBorderMove.Refused(StepRefusal.OutsideTheMusic);
        if (timelineSeconds - tiling.Spans[index].StartSeconds < BorderToleranceSeconds)
            return StepBorderMove.Refused(StepRefusal.TooShort);
        if (
            index + 1 < tiling.Spans.Count
            && timelineSeconds > tiling.Spans[index + 1].StartSeconds + BorderToleranceSeconds
        )
            return StepBorderMove.Refused(StepRefusal.OverlapsAStep);

        return music.EndAnchorAt(Math.Min(timelineSeconds, music.LengthSeconds)) is { } end
            ? StepBorderMove.To(end)
            : StepBorderMove.Refused(StepRefusal.OutsideTheMusic);
    }

    [Pure]
    private static List<StepSpan> SpansOf(IEnumerable<LocatedStep> located)
    {
        var spans = new List<StepSpan>();
        foreach (
            var played in located
                .SelectMany(PlayedSpanOf)
                .OrderBy(span => span.StartSeconds)
                .ThenBy(span => span.StepId)
        )
            if (
                spans.Count == 0
                || played.StartSeconds >= spans[^1].EndSeconds - BorderToleranceSeconds
            )
                spans.Add(played);

        return spans;
    }

    [Pure]
    private static IEnumerable<StepSpan> PlayedSpanOf(LocatedStep step) =>
        step is { Start: { } start, End: { } end } && end - start >= BorderToleranceSeconds
            ? [new StepSpan(step.StepId, start, end)]
            : [];

    [Pure]
    private static StepSpan? TailOf(StepTiling tiling, double startSeconds, double endSeconds) =>
        tiling
            .Spans.Where(span =>
                span.StartSeconds + BorderToleranceSeconds < startSeconds
                && startSeconds < span.EndSeconds - BorderToleranceSeconds
                && Math.Abs(span.EndSeconds - endSeconds) < BorderToleranceSeconds
            )
            .Select(span => (StepSpan?)span)
            .FirstOrDefault();

    [Pure]
    private static bool Overlaps(StepTiling tiling, double startSeconds, double endSeconds) =>
        tiling.Spans.Any(span =>
            span.StartSeconds < endSeconds - BorderToleranceSeconds
            && startSeconds < span.EndSeconds - BorderToleranceSeconds
        );

    [Pure]
    private static int IndexOf(StepTiling tiling, int stepId)
    {
        for (var index = 0; index < tiling.Spans.Count; index++)
            if (tiling.Spans[index].StepId == stepId)
                return index;

        return -1;
    }

    [Pure]
    private static bool IsInsideTheMusic(double startSeconds, double endSeconds, ActMusic music) =>
        startSeconds >= 0
        && startSeconds < music.LengthSeconds
        && endSeconds <= music.LengthSeconds + BorderToleranceSeconds;

    private readonly record struct LocatedStep(int StepId, double? Start, double? End);
}
