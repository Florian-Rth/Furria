using Furria.Core.Club;

namespace Furria.Application.Club;

public sealed record CalendarEntryAddOnInput
{
    public required CalendarEntryAddOnKind Kind { get; init; }

    public required CalendarPollInput? Poll { get; init; }

    public required CalendarSignUpListInput? SignUpList { get; init; }
}
