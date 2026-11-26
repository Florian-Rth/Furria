using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarSightQuery
{
    public required int PersonId { get; init; }

    public required CalendarRights Rights { get; init; }

    public required DateOnly From { get; init; }

    public required DateOnly To { get; init; }
}
