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
    ) => new(mediaItemId, startSeconds, endSeconds ?? durationSeconds ?? startSeconds);

    [Pure]
    public static MusicCut OfFinalTrack(int mediaItemId, double? durationSeconds) =>
        new(mediaItemId, 0, durationSeconds ?? 0);
}
