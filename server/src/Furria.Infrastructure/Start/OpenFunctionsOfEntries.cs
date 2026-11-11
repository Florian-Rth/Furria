using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Application.Start;
using Furria.Infrastructure.Club;

namespace Furria.Infrastructure.Start;

internal sealed record OpenFunctionsOfEntries(
    IReadOnlyDictionary<int, IReadOnlyList<PlacedPoll>> Polls,
    IReadOnlyDictionary<int, IReadOnlyList<PlacedSignUpList>> SignUpLists
)
{
    [Pure]
    public IReadOnlyList<StartPoll> PollsOf(int calendarEntryId) =>
        [
            .. Polls
                .GetValueOrDefault(calendarEntryId, [])
                .Where(placed => !placed.Details.IsClosed)
                .OrderBy(placed => placed.Position)
                .Select(ToPoll),
        ];

    [Pure]
    public IReadOnlyList<StartSignUpList> SignUpListsOf(int calendarEntryId) =>
        [
            .. SignUpLists
                .GetValueOrDefault(calendarEntryId, [])
                .Where(placed => !placed.Details.IsClosed)
                .OrderBy(placed => placed.Position)
                .Select(ToSignUpList),
        ];

    [Pure]
    private static StartPoll ToPoll(PlacedPoll placed) =>
        new()
        {
            PollId = placed.Details.PollId,
            Position = placed.Position,
            Question = placed.Details.Question,
            AllowsMultipleChoices = placed.Details.AllowsMultipleChoices,
            IsAnonymous = placed.Details.IsAnonymous,
            IsOwed = !placed.Details.Options.Any(option => option.ViewerChose),
            Options = [.. placed.Details.Options.Select(ToOption)],
        };

    [Pure]
    private static StartPollOption ToOption(CalendarPollOptionDetails option) =>
        new()
        {
            OptionId = option.OptionId,
            Label = option.Label,
            ViewerChose = option.ViewerChose,
        };

    [Pure]
    private static StartSignUpList ToSignUpList(PlacedSignUpList placed)
    {
        var ownLine = placed.Details.Lines.FirstOrDefault(line => line.ByViewer);

        return new StartSignUpList
        {
            SignUpListId = placed.Details.SignUpListId,
            Position = placed.Position,
            Title = placed.Details.Title,
            Hint = placed.Details.Hint,
            IsOwed = ownLine is null,
            ViewerText = ownLine?.Text,
        };
    }
}
