namespace Furria.Core.Groups;

public sealed record UsualTrainingOccurrence
{
    public required int UsualTrainingTimeId { get; init; }

    public required int GroupId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }
}
