using Furria.Application.RunningOrders;
using Furria.Core.Studio;

namespace Furria.Application.Studio;

public sealed record ChoreographyVersionSummary
{
    public required int Version { get; init; }

    public required ChoreographyVersionKind Kind { get; init; }

    public required int? RestoredFromVersion { get; init; }

    public required DateTimeOffset SavedAt { get; init; }

    public required CastMember? SavedBy { get; init; }
}
