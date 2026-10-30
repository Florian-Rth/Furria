using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record SaveEveningChoreographyCommand
{
    public required ActEveningCommand Evening { get; init; }

    public required int? BaseVersion { get; init; }

    public required int? SessionVersion { get; init; }

    public required IReadOnlyList<SpotTrack> ChangedTracks { get; init; }
}
