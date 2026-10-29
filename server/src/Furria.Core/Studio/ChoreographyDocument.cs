namespace Furria.Core.Studio;

public sealed record ChoreographyDocument(IReadOnlyList<SpotTrack> Tracks)
{
    public static readonly ChoreographyDocument Empty = new([]);
}
