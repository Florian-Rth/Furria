namespace Furria.Application.RunningOrders;

public sealed record SetActArchivedCommand
{
    public required int ActId { get; init; }

    public required bool Archived { get; init; }
}
