namespace Furria.Application.Studio;

public sealed record MyActEveningSummary
{
    public required int EventId { get; init; }

    public required string Title { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required int? Position { get; init; }
}
