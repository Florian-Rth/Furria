using Furria.Core.RunningOrders;

namespace Furria.Application.Studio;

public sealed record GroupActSummary
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int SessionYear { get; init; }

    public required bool IsClosed { get; init; }

    public required bool ViewerInCast { get; init; }
}
