using System.Diagnostics.Contracts;
using Furria.Core.Club;

namespace Furria.Application.Club;

public static class CalendarOpenFunctions
{
    [Pure]
    public static IReadOnlyList<CalendarOpenFunction> Of(
        IReadOnlyList<CalendarEntryAddOnDetails> addOns
    ) => [.. addOns.Select(OpenFunctionOf).OfType<CalendarOpenFunction>()];

    [Pure]
    private static CalendarOpenFunction? OpenFunctionOf(CalendarEntryAddOnDetails addOn) =>
        addOn switch
        {
            { Poll: { IsClosed: false } poll } => new CalendarOpenFunction
            {
                Kind = CalendarEntryAddOnKind.Poll,
                AddOnId = poll.PollId,
                HasAnswered = poll.Options.Any(option => option.ViewerChose),
            },
            { SignUpList: { IsClosed: false } list } => new CalendarOpenFunction
            {
                Kind = CalendarEntryAddOnKind.SignUpList,
                AddOnId = list.SignUpListId,
                HasAnswered = list.Lines.Any(line => line.ByViewer),
            },
            _ => null,
        };
}
