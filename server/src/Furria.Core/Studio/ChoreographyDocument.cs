using System.Diagnostics.Contracts;

namespace Furria.Core.Studio;

public sealed record ChoreographyDocument(IReadOnlyList<SpotTrack> Tracks)
{
    public static readonly ChoreographyDocument Empty = new([]);

    [Pure]
    public ChoreographyDocument WithoutSpot(int spotId) =>
        new([.. Tracks.Where(track => track.SpotId != spotId)]);
}
