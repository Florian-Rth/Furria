using Furria.Application.RunningOrders;

namespace Furria.Application.Studio;

public sealed record StudioSpotDetails
{
    public required int SpotId { get; init; }

    public required int Number { get; init; }

    public required CastMember? Person { get; init; }
}
