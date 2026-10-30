namespace Furria.Application.RunningOrders;

public sealed record MoveLiveCommand
{
    public required int EventId { get; init; }

    public required int? From { get; init; }

    public required int? To { get; init; }
}
