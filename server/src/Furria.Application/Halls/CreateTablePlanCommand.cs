namespace Furria.Application.Halls;

public sealed record CreateTablePlanCommand
{
    public required int EventId { get; init; }

    public required int HallId { get; init; }

    public required int? CopyFromEventId { get; init; }
}
