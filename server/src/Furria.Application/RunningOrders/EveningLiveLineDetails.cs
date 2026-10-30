using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record EveningLiveLineDetails
{
    public required int AppearanceId { get; init; }

    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupReference? Group { get; init; }

    public required int Position { get; init; }

    public required bool IsOwn { get; init; }

    public required IReadOnlyList<CastMember> Cast { get; init; }

    public required IReadOnlySet<int> StandInIds { get; init; }

    public required IReadOnlyList<CastMember> Missing { get; init; }
}
