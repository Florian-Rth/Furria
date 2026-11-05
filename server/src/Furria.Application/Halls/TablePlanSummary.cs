namespace Furria.Application.Halls;

public sealed record TablePlanSummary
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required int HallId { get; init; }

    public required string HallName { get; init; }

    public required int Tables { get; init; }
}
