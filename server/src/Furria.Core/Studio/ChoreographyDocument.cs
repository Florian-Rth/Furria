using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed record ChoreographyDocument(IReadOnlyList<SpotTrack> Tracks)
{
    public static readonly ChoreographyDocument Empty = new([]);

    [Pure]
    public ChoreographyDocument WithoutSpot(int spotId) =>
        new([.. Tracks.Where(track => track.SpotId != spotId)]);

    [Pure]
    public bool Matches(ChoreographyDocument other) =>
        Tracks.Count == other.Tracks.Count
        && Tracks
            .Zip(other.Tracks)
            .All(pair =>
                pair.First.SpotId == pair.Second.SpotId
                && pair.First.Keyframes.SequenceEqual(pair.Second.Keyframes)
            );
}
