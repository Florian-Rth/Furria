using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class CalendarSignUpListRecords
{
    private const string UnknownSignUpListMessage = "Diese Eintragsliste gibt es nicht.";
    private const string ClosedSignUpListEditMessage =
        "Eine geschlossene Eintragsliste kann nicht mehr geändert werden.";

    private static readonly IReadOnlyDictionary<
        int,
        IReadOnlyList<PlacedSignUpList>
    > NoSignUpLists = new Dictionary<int, IReadOnlyList<PlacedSignUpList>>();

    internal static string? ReconcileSignUpLists(
        CalendarEntry entry,
        IReadOnlyList<CalendarEntryAddOnInput> addOns,
        DateTimeOffset now
    )
    {
        var wanted = WantedListsOf(addOns);

        foreach (var list in entry.SignUpLists)
            list.ClosedAt ??= CalendarAddOnClosing.StampOf(list.SignUpUntil, entry.StartsAt, now);

        if (!wanted.All(placed => IsNewOrHeld(entry, placed)))
            return UnknownSignUpListMessage;

        if (wanted.Any(placed => ChangesAClosedList(entry, placed)))
            return ClosedSignUpListEditMessage;

        foreach (var dropped in entry.SignUpLists.Where(list => !IsKept(list, wanted)).ToList())
            entry.SignUpLists.Remove(dropped);

        foreach (var placed in wanted)
            Apply(ListFor(entry, placed.List.SignUpListId), placed);

        return null;
    }

    internal static async Task<
        IReadOnlyDictionary<int, IReadOnlyList<PlacedSignUpList>>
    > SignUpListsOfEntriesAsync(
        this AppDbContext dbContext,
        IReadOnlyList<int> calendarEntryIds,
        int? viewerPersonId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        if (calendarEntryIds.Count == 0)
            return NoSignUpLists;

        var lists = await dbContext
            .CalendarSignUpLists.AsNoTracking()
            .Where(list => calendarEntryIds.Contains(list.CalendarEntryId))
            .Select(list => new SignUpListRow(
                list.Id,
                list.CalendarEntryId,
                list.Position,
                list.Title,
                list.Hint,
                list.SignUpUntil,
                list.ClosedAt,
                list.ClosedBy == null ? null : list.ClosedBy.FirstName,
                list.ClosedBy == null ? null : list.ClosedBy.LastName,
                list.CalendarEntry!.StartsAt,
                list.LastRemindedAt,
                list.Lines.OrderBy(line => line.CreatedAt)
                    .ThenBy(line => line.Id)
                    .Select(line => new LineRow(
                        line.Id,
                        line.PersonId,
                        line.Person!.FirstName,
                        line.Person!.LastName,
                        line.Text
                    ))
                    .ToList()
            ))
            .AsSplitQuery()
            .ToListAsync(ct);

        if (lists.Count == 0)
            return NoSignUpLists;

        return lists
            .GroupBy(list => list.CalendarEntryId)
            .ToDictionary(
                group => group.Key,
                group =>
                    (IReadOnlyList<PlacedSignUpList>)
                        [
                            .. group.Select(list => new PlacedSignUpList(
                                list.Position,
                                ToDetails(list, viewerPersonId, now),
                                list.LastRemindedAt
                            )),
                        ]
            );
    }

    [Pure]
    private static CalendarSignUpListDetails ToDetails(
        SignUpListRow list,
        int? viewerPersonId,
        DateTimeOffset now
    ) =>
        new()
        {
            SignUpListId = list.SignUpListId,
            Title = list.Title,
            Hint = list.Hint,
            SignUpUntil = list.SignUpUntil,
            ClosedAt = list.ClosedAt,
            ClosedBy = CalendarClosers.Of(list.ClosedByFirstName, list.ClosedByLastName),
            IsClosed = CalendarAddOnClosing.IsClosed(
                list.ClosedAt,
                list.SignUpUntil,
                list.EntryStartsAt,
                now
            ),
            Lines = [.. list.Lines.Select(line => ToLineDetails(line, viewerPersonId))],
        };

    [Pure]
    private static CalendarSignUpLineDetails ToLineDetails(LineRow line, int? viewerPersonId) =>
        new()
        {
            LineId = line.LineId,
            PersonId = line.PersonId,
            FirstName = line.FirstName,
            LastName = line.LastName,
            Text = line.Text,
            ByViewer = line.PersonId == viewerPersonId,
        };

    [Pure]
    private static IReadOnlyList<WantedSignUpList> WantedListsOf(
        IReadOnlyList<CalendarEntryAddOnInput> addOns
    ) =>
        [
            .. addOns.SelectMany(
                (addOn, position) =>
                    addOn.SignUpList is { } list
                        ? [new WantedSignUpList(position, list)]
                        : Array.Empty<WantedSignUpList>()
            ),
        ];

    [Pure]
    private static bool IsNewOrHeld(CalendarEntry entry, WantedSignUpList placed) =>
        placed.List.SignUpListId is not { } listId
        || entry.SignUpLists.Any(list => list.Id == listId);

    [Pure]
    private static bool ChangesAClosedList(CalendarEntry entry, WantedSignUpList placed) =>
        entry.SignUpLists.FirstOrDefault(list => list.Id == placed.List.SignUpListId)
            is { ClosedAt: not null } held
        && (
            held.Title != placed.List.Title.Trim()
            || held.Hint != HintOf(placed.List.Hint)
            || held.SignUpUntil != placed.List.SignUpUntil
        );

    [Pure]
    private static bool IsKept(CalendarSignUpList held, IReadOnlyList<WantedSignUpList> wanted) =>
        wanted.Any(placed => placed.List.SignUpListId == held.Id);

    [Pure]
    private static string? HintOf(string? hint) =>
        string.IsNullOrWhiteSpace(hint) ? null : hint.Trim();

    private static CalendarSignUpList ListFor(CalendarEntry entry, int? signUpListId)
    {
        if (signUpListId is { } heldId)
            return entry.SignUpLists.Single(list => list.Id == heldId);

        var list = new CalendarSignUpList();
        entry.SignUpLists.Add(list);
        return list;
    }

    private static void Apply(CalendarSignUpList list, WantedSignUpList placed)
    {
        list.Position = placed.Position;
        list.Title = placed.List.Title.Trim();
        list.Hint = HintOf(placed.List.Hint);
        list.SignUpUntil = placed.List.SignUpUntil;
    }

    private sealed record WantedSignUpList(int Position, CalendarSignUpListInput List);

    private sealed record SignUpListRow(
        int SignUpListId,
        int CalendarEntryId,
        int Position,
        string Title,
        string? Hint,
        DateTimeOffset? SignUpUntil,
        DateTimeOffset? ClosedAt,
        string? ClosedByFirstName,
        string? ClosedByLastName,
        DateTimeOffset EntryStartsAt,
        DateTimeOffset? LastRemindedAt,
        IReadOnlyList<LineRow> Lines
    );

    private sealed record LineRow(
        int LineId,
        int PersonId,
        string FirstName,
        string LastName,
        string? Text
    );
}

internal sealed record PlacedSignUpList(
    int Position,
    CalendarSignUpListDetails Details,
    DateTimeOffset? LastRemindedAt
);
