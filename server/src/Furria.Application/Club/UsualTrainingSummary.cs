using Furria.Core.Groups;

namespace Furria.Application.Club;

public sealed record UsualTrainingSummary
{
    public required int UsualTrainingTimeId { get; init; }

    public required int GroupId { get; init; }

    public required string GroupName { get; init; }

    public required GroupTone? GroupTone { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset EndsAt { get; init; }

    public required int? VenueId { get; init; }

    public required string? VenueName { get; init; }
}
