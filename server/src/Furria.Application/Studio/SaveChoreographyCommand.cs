using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record SaveChoreographyCommand
{
    public required int ActId { get; init; }

    public required int? BaseVersion { get; init; }

    public required IReadOnlyList<SpotTrack> ChangedTracks { get; init; }
}
