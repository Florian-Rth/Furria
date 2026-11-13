namespace Furria.Application.Club;

public sealed record BorrowedAddOnInput
{
    public required int CalendarEntryId { get; init; }

    public required int? AddOnId { get; init; }
}
