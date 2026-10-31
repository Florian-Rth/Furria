using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class ActSteps
{
    private const double BorderToleranceSeconds = 0.01;

    [Pure]
    public static StepTiling Tile(IEnumerable<StepStart> steps, ActMusic music)
    {
        var located = steps.Select(step => (step.StepId, Place: music.Locate(step.Start))).ToList();
        var onTimeline = located
            .SelectMany(step =>
                step.Place.TimelineSeconds is { } seconds
                    ? [(step.StepId, Seconds: seconds)]
                    : Array.Empty<(int StepId, double Seconds)>()
            )
            .OrderBy(step => step.Seconds)
            .ThenBy(step => step.StepId)
            .ToList();

        return new StepTiling(
            SpansOf(onTimeline, music.LengthSeconds),
            [
                .. located
                    .Where(step => step.Place.TimelineSeconds is null)
                    .Select(step => step.StepId),
            ]
        );
    }

    [Pure]
    public static StepMark MarkAt(StepTiling tiling, double timelineSeconds, ActMusic music)
    {
        if (
            !IsInsideTheMusic(timelineSeconds, music)
            || music.AnchorAt(timelineSeconds) is not { } mark
        )
            return StepMark.Refused(StepMarkRefusal.OutsideTheMusic);

        if (tiling.Spans.Count > 0)
            return LiesOnABorder(tiling, timelineSeconds)
                ? StepMark.Refused(StepMarkRefusal.OnABorder)
                : StepMark.Starting(mark);

        return music.AnchorAt(0) is { } opening && timelineSeconds > BorderToleranceSeconds
            ? StepMark.Starting(opening, mark)
            : StepMark.Starting(mark);
    }

    [Pure]
    public static StepMark MoveTo(
        StepTiling tiling,
        int stepId,
        double timelineSeconds,
        ActMusic music
    )
    {
        var index = IndexOf(tiling, stepId);
        if (index < 0)
            return StepMark.Refused(StepMarkRefusal.Adrift);
        if (index == 0)
            return StepMark.Refused(StepMarkRefusal.FirstStep);
        if (!LiesBetweenNeighbours(tiling, index, timelineSeconds))
            return StepMark.Refused(StepMarkRefusal.BeyondANeighbour);

        return music.AnchorAt(timelineSeconds) is { } start
            ? StepMark.Starting(start)
            : StepMark.Refused(StepMarkRefusal.OutsideTheMusic);
    }

    [Pure]
    private static int IndexOf(StepTiling tiling, int stepId)
    {
        for (var index = 0; index < tiling.Spans.Count; index++)
            if (tiling.Spans[index].StepId == stepId)
                return index;

        return -1;
    }

    [Pure]
    private static bool LiesBetweenNeighbours(
        StepTiling tiling,
        int index,
        double timelineSeconds
    ) =>
        timelineSeconds > tiling.Spans[index - 1].StartSeconds + BorderToleranceSeconds
        && timelineSeconds < tiling.Spans[index].EndSeconds - BorderToleranceSeconds;

    [Pure]
    private static List<StepSpan> SpansOf(
        IReadOnlyList<(int StepId, double Seconds)> ordered,
        double lengthSeconds
    ) =>
        [
            .. ordered.Select(
                (step, index) =>
                    new StepSpan(
                        step.StepId,
                        index == 0 ? 0 : step.Seconds,
                        index + 1 < ordered.Count ? ordered[index + 1].Seconds : lengthSeconds
                    )
            ),
        ];

    [Pure]
    private static bool IsInsideTheMusic(double timelineSeconds, ActMusic music) =>
        timelineSeconds >= 0 && timelineSeconds < music.LengthSeconds;

    [Pure]
    private static bool LiesOnABorder(StepTiling tiling, double timelineSeconds) =>
        tiling.Spans.Any(span =>
            Math.Abs(span.StartSeconds - timelineSeconds) < BorderToleranceSeconds
        );
}
