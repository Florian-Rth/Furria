namespace Furria.Application.RunningOrders;

public sealed record UpdateActCommand
{
    public required int ActId { get; init; }

    public required ActFactsCommand Facts { get; init; }
}
