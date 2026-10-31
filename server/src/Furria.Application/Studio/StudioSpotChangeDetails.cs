using Furria.Application.RunningOrders;

namespace Furria.Application.Studio;

public sealed record StudioSpotChangeDetails
{
    public required int SpotId { get; init; }

    public required CastMember? Person { get; init; }
}
