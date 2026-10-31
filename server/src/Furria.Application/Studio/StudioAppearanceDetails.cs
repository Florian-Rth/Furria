using Furria.Application.RunningOrders;

namespace Furria.Application.Studio;

public sealed record StudioAppearanceDetails
{
    public required int AppearanceId { get; init; }

    public required int? Position { get; init; }

    public required IReadOnlyList<CastMember> Added { get; init; }

    public required IReadOnlyList<int> RemovedPersonIds { get; init; }

    public required IReadOnlyList<StudioSpotChangeDetails> SpotChanges { get; init; }

    public required StudioEveningChoreographyDetails? Choreography { get; init; }
}
