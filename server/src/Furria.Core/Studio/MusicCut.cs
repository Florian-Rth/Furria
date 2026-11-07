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
    public static IReadOnlyList<MusicCut> OfSong(
        int mediaItemId,
        IReadOnlyList<SongPiece> pieces,
        double? durationSeconds
    ) =>
        pieces.Count == 0
            ? [new MusicCut(mediaItemId, 0, durationSeconds ?? 0)]
            :
            [
                .. pieces.Select(piece => new MusicCut(
                    mediaItemId,
                    piece.StartSeconds,
                    piece.EndSeconds
                )),
            ];

    [Pure]
    public static MusicCut OfFinalTrack(int mediaItemId, double? durationSeconds) =>
        new(mediaItemId, 0, durationSeconds ?? 0);
}
