using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntriesSightQuery
{
    public required int PersonId { get; init; }

    public required CalendarRights Rights { get; init; }

    public required IReadOnlyCollection<int> CalendarEntryIds { get; init; }
}
