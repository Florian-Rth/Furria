namespace Furria.Core.Studio;

public sealed record ChoreographyMerge(
    ChoreographyDocument Document,
    IReadOnlyList<ChoreographyOverlap> Overlaps
)
{
    public bool IsClean => Overlaps.Count == 0;
}
