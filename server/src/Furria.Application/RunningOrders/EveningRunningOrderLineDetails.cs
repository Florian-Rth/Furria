using Furria.Core.RunningOrders;

namespace Furria.Application.RunningOrders;

public sealed record EveningRunningOrderLineDetails
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required ActGroupReference? Group { get; init; }

    public required int Position { get; init; }

    public required DateTimeOffset StageStartsAt { get; init; }

    public required bool IsOwn { get; init; }
}
