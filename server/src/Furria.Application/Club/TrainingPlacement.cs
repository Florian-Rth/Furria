namespace Furria.Application.Club;

public sealed record TrainingPlacement
{
    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }
}
