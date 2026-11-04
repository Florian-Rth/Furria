using Furria.Core.Halls;

namespace Furria.Application.Halls;

public sealed record TablePlanDetails
{
    public required int EventId { get; init; }

    public required int HallId { get; init; }

    public required TablePlanDocument Document { get; init; }

    public required int Version { get; init; }

    public required HallDetails Hall { get; init; }
}
