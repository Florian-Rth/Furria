namespace Furria.Core.Groups;

public sealed record TrainingCandidate
{
    public required int GroupTrainingSlotId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }
}
