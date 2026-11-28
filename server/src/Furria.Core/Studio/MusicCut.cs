using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public readonly record struct MusicCut(
    int SourceMediaItemId,
    double StartSeconds,
    double EndSeconds
)
{
    public double LengthSeconds => EndSeconds - StartSeconds;

    [Pure]
    public static MusicCut OfSong(
        int mediaItemId,
        double startSeconds,
        double? endSeconds,
        double? durationSeconds
    ) =>
        new(
            mediaItemId,
            startSeconds,
            Math.Max(startSeconds, endSeconds ?? durationSeconds ?? startSeconds)
        );

    [Pure]
    public bool Overlaps(MusicCut other) =>
        SourceMediaItemId == other.SourceMediaItemId
        && StartSeconds < other.EndSeconds - CutLength.RoundingSeconds
        && other.StartSeconds < EndSeconds - CutLength.RoundingSeconds;

    [Pure]
    public bool CanSplitAt(double seconds) =>
        CutLength.IsLongEnough(StartSeconds, seconds)
        && CutLength.IsLongEnough(seconds, EndSeconds);
}
