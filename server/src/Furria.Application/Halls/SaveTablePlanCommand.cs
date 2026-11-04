using Furria.Core.Halls;

namespace Furria.Application.Halls;

public sealed record SaveTablePlanCommand
{
    public required int EventId { get; init; }

    public required int HallId { get; init; }

    public required TablePlanDocument Document { get; init; }

    public required int Version { get; init; }
}
