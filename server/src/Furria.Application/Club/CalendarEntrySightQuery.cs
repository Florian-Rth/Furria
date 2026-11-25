using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntrySightQuery
{
    public required int PersonId { get; init; }

    public required CalendarRights Rights { get; init; }

    public required int CalendarEntryId { get; init; }
}
