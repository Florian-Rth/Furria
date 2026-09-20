namespace Furria.Application.Club;

public sealed record VenueCollisionQuery
{
    public required int ViewerPersonId { get; init; }

    public required int VenueId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }

    public required int? ExcludeCalendarEntryId { get; init; }
}
