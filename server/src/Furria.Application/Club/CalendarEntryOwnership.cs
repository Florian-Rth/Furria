namespace Furria.Application.Club;

public sealed record CalendarEntryOwnership
{
    public required int CalendarEntryId { get; init; }

    public required int? OwnerGroupId { get; init; }
}
