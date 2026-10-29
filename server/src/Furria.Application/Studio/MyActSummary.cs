using Furria.Application.RunningOrders;
using Furria.Core.RunningOrders;

namespace Furria.Application.Studio;

public sealed record MyActSummary
{
    public required int ActId { get; init; }

    public required string Name { get; init; }

    public required ActKind? Kind { get; init; }

    public required int SessionYear { get; init; }

    public required ActGroupReference? Group { get; init; }
}
