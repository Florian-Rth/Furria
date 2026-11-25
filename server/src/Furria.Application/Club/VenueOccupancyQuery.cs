using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record VenueOccupancyQuery
{
    public required int PersonId { get; init; }

    public required CalendarRights Rights { get; init; }

    public required int VenueId { get; init; }

    public required DateTimeOffset StartsAt { get; init; }

    public required DateTimeOffset? EndsAt { get; init; }
}
