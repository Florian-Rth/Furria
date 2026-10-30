namespace Furria.Application.RunningOrders;

public sealed record LiveDirectionDetails
{
    public required int? AppearanceId { get; init; }

    public required DateTimeOffset StartedAt { get; init; }

    public required DateTimeOffset MovedAt { get; init; }
}
