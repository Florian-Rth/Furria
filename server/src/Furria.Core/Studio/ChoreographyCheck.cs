using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public static class ChoreographyCheck
{
    private const double FullTurnDegrees = 360;

    [Pure]
    public static IReadOnlyList<ChoreographyProblem> ProblemsOf(
        ChoreographyDocument document,
        ChoreographyFrame frame
    ) =>
        [
            .. TwiceTrackedSpots(document),
            .. document.Tracks.SelectMany(track => ProblemsOf(track, frame)),
        ];

    [Pure]
    private static IEnumerable<ChoreographyProblem> TwiceTrackedSpots(
        ChoreographyDocument document
    ) =>
        document
            .Tracks.GroupBy(track => track.SpotId)
            .Where(tracks => tracks.Count() > 1)
            .Select(tracks => new ChoreographyProblem(
                ChoreographyProblemKind.SpotTrackedTwice,
                tracks.Key,
                null
            ));

    [Pure]
    private static IEnumerable<ChoreographyProblem> ProblemsOf(
        SpotTrack track,
        ChoreographyFrame frame
    )
    {
        if (!frame.SpotIds.Contains(track.SpotId))
            return
            [
                new ChoreographyProblem(ChoreographyProblemKind.UnknownSpot, track.SpotId, null),
            ];

        return
        [
            .. track.Keyframes.SelectMany(
                (keyframe, index) =>
                    KeyframeProblemsOf(keyframe, frame)
                        .Select(kind => new ChoreographyProblem(kind, track.SpotId, index))
            ),
            .. OutOfOrderKeyframes(track, frame.Music),
        ];
    }

    [Pure]
    private static IEnumerable<ChoreographyProblemKind> KeyframeProblemsOf(
        Keyframe keyframe,
        ChoreographyFrame frame
    )
    {
        if (!frame.MusicSourceIds.Contains(keyframe.At.SourceMediaItemId))
            yield return ChoreographyProblemKind.UnknownMusic;

        if (!frame.Stage.Contains(keyframe.Position))
            yield return ChoreographyProblemKind.OutsideTheStage;

        if (keyframe.FacingDegrees is { } facing && facing is < 0 or >= FullTurnDegrees)
            yield return ChoreographyProblemKind.FacingOutOfRange;
    }

    [Pure]
    private static IEnumerable<ChoreographyProblem> OutOfOrderKeyframes(
        SpotTrack track,
        ActMusic music
    )
    {
        double? previous = null;

        for (var index = 0; index < track.Keyframes.Count; index++)
        {
            if (music.Locate(track.Keyframes[index].At).TimelineSeconds is not { } seconds)
                continue;

            if (previous is { } before && seconds <= before)
                yield return new ChoreographyProblem(
                    ChoreographyProblemKind.OutOfMusicOrder,
                    track.SpotId,
                    index
                );

            previous = Math.Max(previous ?? seconds, seconds);
        }
    }
}
