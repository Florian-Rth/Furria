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
