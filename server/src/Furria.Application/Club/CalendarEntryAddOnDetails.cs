using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntryAddOnDetails
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required CalendarPollDetails? Poll { get; init; }
}
