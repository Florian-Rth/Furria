namespace Furria.Core.Studio;

public sealed record MusicBeforeReplacement(
    IReadOnlyList<SongSnapshot> Songs,
    IReadOnlyList<StepBorders> Steps,
    IReadOnlyList<PlacedVideo> Videos,
    ChoreographyDocument? Choreography
)
{
    public static readonly MusicBeforeReplacement Empty = new([], [], [], null);
}
