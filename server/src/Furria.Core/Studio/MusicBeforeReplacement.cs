namespace Furria.Core.Studio;

public sealed record MusicBeforeReplacement(
    IReadOnlyList<SongSnapshot> Songs,
    IReadOnlyList<StepAnchors> Steps,
    IReadOnlyList<PlacedVideo> Videos,
    ChoreographyDocument? Choreography
)
{
    public static readonly MusicBeforeReplacement Empty = new([], [], [], null);
}
