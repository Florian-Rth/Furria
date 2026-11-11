using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarOpenFunction
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required int AddOnId { get; init; }

    public required bool HasAnswered { get; init; }
}
