using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record ChoreographySaveDetails
{
    public required int? Version { get; init; }

    public required IReadOnlyList<ChoreographyOverlap> Overlaps { get; init; }
}
