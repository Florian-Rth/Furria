namespace Furria.Application.RunningOrders;

public sealed record ActSeasonDetails
{
    public required int SessionYear { get; init; }

    public required IReadOnlyList<int> SessionYears { get; init; }

    public required IReadOnlyList<SeasonEveningSummary> Evenings { get; init; }

    public required IReadOnlyList<SeasonActSummary> Acts { get; init; }
}
