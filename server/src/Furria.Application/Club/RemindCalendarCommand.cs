using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record RemindCalendarCommand
{
    public required int ActorAccountId { get; init; }

    public required int CalendarEntryId { get; init; }

    public required CalendarEntryAddOnKind Kind { get; init; }

    public required int? AddOnId { get; init; }
}
