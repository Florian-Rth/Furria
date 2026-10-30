namespace Furria.Application.RunningOrders;

public sealed record EveningLiveDetails
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required IReadOnlyList<EveningLiveLineDetails> Lines { get; init; }
}
