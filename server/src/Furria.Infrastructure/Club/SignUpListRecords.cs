using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

internal static class SignUpListRecords
{
    private const string UnknownSignUpListMessage = "Diese Eintragsliste gibt es nicht.";
    private const string ClosedSignUpListEditMessage =
        "Eine geschlossene Eintragsliste kann nicht mehr geändert werden.";

    private static readonly IReadOnlyDictionary<
        int,
        IReadOnlyList<PlacedSignUpList>
    > NoSignUpLists = new Dictionary<int, IReadOnlyList<PlacedSignUpList>>();

    internal static string? ReconcileSignUpLists(
        this AppDbContext dbContext,
        CalendarEntry entry,
        IReadOnlyList<CalendarEntryAddOnInput> addOns,
        DateTimeOffset now
    ) =>
        dbContext.ReconcileSignUpLists(
            new AddOnHolding<SignUpList>(entry.SignUpLists, entry.StartsAt),
            [.. addOns.Select(addOn => addOn.SignUpList)],
            now
        );

    internal static string? ReconcileSignUpLists(
        this AppDbContext dbContext,
        AddOnHolding<SignUpList> holding,
        IReadOnlyList<SignUpListInput?> wantedByPosition,
        DateTimeOffset now
    )
    {
        var held = holding.Held;
        var wanted = WantedListsOf(wantedByPosition);

        foreach (var list in held)
            list.ClosedAt ??= AddOnClosing.StampOf(list.SignUpUntil, holding.HostClosesAt, now);

        if (!wanted.All(placed => IsNewOrHeld(held, placed)))
            return UnknownSignUpListMessage;

        if (wanted.Any(placed => ChangesAClosedList(held, placed)))
            return ClosedSignUpListEditMessage;

        foreach (var dropped in held.Where(list => !IsKept(list, wanted)).ToList())
        {
            held.Remove(dropped);
            dbContext.SignUpLists.Remove(dropped);
        }

        foreach (var placed in wanted)
            Apply(ListFor(held, placed.List.SignUpListId), placed);

        return null;
    }

    internal static Task<
        IReadOnlyDictionary<int, IReadOnlyList<PlacedSignUpList>>
    > SignUpListsOfEntriesAsync(
        this AppDbContext dbContext,
        IReadOnlyList<int> calendarEntryIds,
        int? viewerPersonId,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        calendarEntryIds.Count == 0
            ? Task.FromResult(NoSignUpLists)
            : dbContext.PlacedSignUpListsAsync(
                dbContext.SignUpLists.Where(list =>
                    calendarEntryIds.Contains(list.CalendarEntryId!.Value)
                ),
                viewerPersonId,
                now,
                ct
            );

    internal static Task<
        IReadOnlyDictionary<int, IReadOnlyList<PlacedSignUpList>>
    > SignUpListsOfAnnouncementsAsync(
        this AppDbContext dbContext,
        IReadOnlyList<int> announcementIds,
        int? viewerPersonId,
        DateTimeOffset now,
        CancellationToken ct
    ) =>
        announcementIds.Count == 0
            ? Task.FromResult(NoSignUpLists)
            : dbContext.PlacedSignUpListsAsync(
                dbContext.SignUpLists.Where(list =>
                    announcementIds.Contains(list.AnnouncementId!.Value)
                ),
                viewerPersonId,
                now,
                ct
            );

    private static async Task<
        IReadOnlyDictionary<int, IReadOnlyList<PlacedSignUpList>>
    > PlacedSignUpListsAsync(
        this AppDbContext dbContext,
        IQueryable<SignUpList> hosted,
        int? viewerPersonId,
        DateTimeOffset now,
        CancellationToken ct
    )
    {
        var lists = await hosted
            .AsNoTracking()
            .Select(list => new SignUpListRow(
                list.Id,
                list.CalendarEntryId ?? list.AnnouncementId ?? 0,
                list.Position,
                list.Title,
                list.Hint,
                list.SignUpUntil,
                list.ClosedAt,
                list.ClosedBy == null ? null : list.ClosedBy.FirstName,
                list.ClosedBy == null ? null : list.ClosedBy.LastName,
                (DateTimeOffset?)list.CalendarEntry!.StartsAt,
                list.Announcement!.ValidUntil,
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
            .GroupBy(list => list.HostId)
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
    private static SignUpListDetails ToDetails(
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
            IsClosed = AddOnClosing.IsClosed(
                list.ClosedAt,
                list.SignUpUntil,
                list.HostClosesAt,
                now
            ),
            Lines = [.. list.Lines.Select(line => ToLineDetails(line, viewerPersonId))],
        };

    [Pure]
    private static SignUpLineDetails ToLineDetails(LineRow line, int? viewerPersonId) =>
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
        IReadOnlyList<SignUpListInput?> wantedByPosition
    ) =>
        [
            .. wantedByPosition.SelectMany(
                (wanted, position) =>
                    wanted is { } list
                        ? [new WantedSignUpList(position, list)]
                        : Array.Empty<WantedSignUpList>()
            ),
        ];

    [Pure]
    private static bool IsNewOrHeld(ICollection<SignUpList> held, WantedSignUpList placed) =>
        placed.List.SignUpListId is not { } listId || held.Any(list => list.Id == listId);

    [Pure]
    private static bool ChangesAClosedList(
        ICollection<SignUpList> lists,
        WantedSignUpList placed
    ) =>
        lists.FirstOrDefault(list => list.Id == placed.List.SignUpListId)
            is { ClosedAt: not null } held
        && (
            held.Title != placed.List.Title.Trim()
            || held.Hint != HintOf(placed.List.Hint)
            || held.SignUpUntil != placed.List.SignUpUntil
        );

    [Pure]
    private static bool IsKept(SignUpList held, IReadOnlyList<WantedSignUpList> wanted) =>
        wanted.Any(placed => placed.List.SignUpListId == held.Id);

    [Pure]
    private static string? HintOf(string? hint) =>
        string.IsNullOrWhiteSpace(hint) ? null : hint.Trim();

    private static SignUpList ListFor(ICollection<SignUpList> held, int? signUpListId)
    {
        if (signUpListId is { } heldId)
            return held.Single(list => list.Id == heldId);

        var list = new SignUpList();
        held.Add(list);
        return list;
    }

    private static void Apply(SignUpList list, WantedSignUpList placed)
    {
        list.Position = placed.Position;
        list.Title = placed.List.Title.Trim();
        list.Hint = HintOf(placed.List.Hint);
        list.SignUpUntil = placed.List.SignUpUntil;
    }

    private sealed record WantedSignUpList(int Position, SignUpListInput List);

    private sealed record SignUpListRow(
        int SignUpListId,
        int HostId,
        int Position,
        string Title,
        string? Hint,
        DateTimeOffset? SignUpUntil,
        DateTimeOffset? ClosedAt,
        string? ClosedByFirstName,
        string? ClosedByLastName,
        DateTimeOffset? EntryStartsAt,
        DateOnly? AnnouncementValidUntil,
        DateTimeOffset? LastRemindedAt,
        IReadOnlyList<LineRow> Lines
    )
    {
        public DateTimeOffset? HostClosesAt =>
            EntryStartsAt ?? AnnouncementAddOns.ClosesAt(AnnouncementValidUntil);
    }

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
    SignUpListDetails Details,
    DateTimeOffset? LastRemindedAt
);
