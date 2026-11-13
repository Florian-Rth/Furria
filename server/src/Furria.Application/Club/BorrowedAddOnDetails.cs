namespace Furria.Application.Club;

public sealed record BorrowedAddOnDetails
{
    public required int? AddOnId { get; init; }

    public required CalendarEntrySummary Entry { get; init; }
}
