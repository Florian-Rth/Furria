namespace Furria.Application.RunningOrders;

public sealed record SessionActsDetails
{
    public required int SessionYear { get; init; }

    public required IReadOnlyList<int> SessionYears { get; init; }

    public required IReadOnlyList<ActSummary> Acts { get; init; }
}
