namespace Furria.Application.RunningOrders;

public sealed record SeasonEveningSummary
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required bool HasRunningOrder { get; init; }

    public required bool IsConfirmed { get; init; }
}
