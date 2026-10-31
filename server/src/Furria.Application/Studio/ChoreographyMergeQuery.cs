using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record ChoreographyMergeQuery
{
    public required int ActId { get; init; }

    public required ChoreographyDocument Baseline { get; init; }

    public required ChoreographyDocument Current { get; init; }

    public required IReadOnlyList<SpotTrack> ChangedTracks { get; init; }
}
