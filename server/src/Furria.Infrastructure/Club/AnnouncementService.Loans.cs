using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    private const string UnlendableAddOnMessage =
        "Diese Funktion kann der Aushang nicht vom Kalendereintrag übernehmen.";
    private const string LoanTwiceMessage =
        "Ein Aushang übernimmt jede Funktion eines Eintrags nur einmal.";

    private static readonly ILookup<int, PlacedLoan> NoLoans = Array
        .Empty<PlacedLoan>()
        .ToLookup(_ => 0);

    private async Task<string?> ReconcileLoansAsync(
        Announcement announcement,
        IReadOnlyList<AnnouncementAddOnInput> addOns,
        int actorAccountId,
        CancellationToken ct
    )
    {
        var wanted = WantedLoansOf(addOns);
        if (wanted.Select(loan => loan.Key).Distinct().Count() != wanted.Count)
            return LoanTwiceMessage;

        var heldKeys = announcement.BorrowedAddOns.Select(KeyOf).ToHashSet();
        var fresh = wanted.Where(loan => !heldKeys.Contains(loan.Key)).ToList();
        if (fresh.Count > 0 && !await LendsAllAsync(actorAccountId, fresh, ct))
            return UnlendableAddOnMessage;

        ApplyLoans(announcement, wanted);
        return null;
    }

    private async Task<bool> LendsAllAsync(
        int actorAccountId,
        IReadOnlyList<WantedLoan> fresh,
        CancellationToken ct
    )
    {
        var entries = await _calendarService.GetLendingEntriesAsync(
            actorAccountId,
            [.. fresh.Select(loan => loan.Key.CalendarEntryId)],
            ct
        );

        return fresh.All(loan =>
            entries.TryGetValue(loan.Key.CalendarEntryId, out var entry) && Holds(entry, loan.Key)
        );
    }

    private static void ApplyLoans(Announcement announcement, IReadOnlyList<WantedLoan> wanted)
    {
        var positions = wanted.ToDictionary(loan => loan.Key, loan => loan.Position);

        foreach (
            var dropped in announcement
                .BorrowedAddOns.Where(loan => !positions.ContainsKey(KeyOf(loan)))
                .ToList()
        )
            announcement.BorrowedAddOns.Remove(dropped);

        foreach (var held in announcement.BorrowedAddOns)
            held.Position = positions[KeyOf(held)];

        var heldKeys = announcement.BorrowedAddOns.Select(KeyOf).ToHashSet();
        foreach (var loan in wanted.Where(loan => !heldKeys.Contains(loan.Key)))
            announcement.BorrowedAddOns.Add(RowOf(loan));
    }

    [Pure]
    private static IReadOnlyList<WantedLoan> WantedLoansOf(
        IReadOnlyList<AnnouncementAddOnInput> addOns
    ) =>
        [
            .. addOns
                .Select(
                    (addOn, position) =>
                        addOn.Borrowed is { } borrowed
                            ? new WantedLoan(
                                new LoanKey(addOn.Kind, borrowed.CalendarEntryId, borrowed.AddOnId),
                                position
                            )
                            : null
                )
                .OfType<WantedLoan>(),
        ];

    [Pure]
    private static LoanKey KeyOf(AnnouncementBorrowedAddOn loan) =>
        new(loan.Kind, loan.CalendarEntryId, loan.PollId ?? loan.SignUpListId);

    [Pure]
    private static LoanRow LoanRowOf(AnnouncementBorrowedAddOn loan) =>
        new(loan.AnnouncementId, KeyOf(loan), loan.Position);

    [Pure]
    private static LoanRow RowOf(AnnouncementBorrowedAddOn loan) =>
        new(loan.AnnouncementId, KeyOf(loan), loan.Position);

    [Pure]
    private static AnnouncementBorrowedAddOn RowOf(WantedLoan loan) =>
        new()
        {
            Kind = loan.Key.Kind,
            CalendarEntryId = loan.Key.CalendarEntryId,
            PollId = loan.Key.Kind == AnnouncementAddOnKind.Poll ? loan.Key.AddOnId : null,
            SignUpListId =
                loan.Key.Kind == AnnouncementAddOnKind.SignUpList ? loan.Key.AddOnId : null,
            Position = loan.Position,
        };

    [Pure]
    private static bool Holds(CalendarEntrySummary entry, LoanKey key) =>
        key.Kind switch
        {
            AnnouncementAddOnKind.Attendance => entry.Attendance is not null,
            AnnouncementAddOnKind.Poll => entry.AddOns.Any(addOn =>
                addOn.Poll?.PollId == key.AddOnId
            ),
            AnnouncementAddOnKind.SignUpList => entry.AddOns.Any(addOn =>
                addOn.SignUpList?.SignUpListId == key.AddOnId
            ),
            _ => false,
        };

    private async Task<ILookup<int, PlacedLoan>> LoansOfAsync(
        IReadOnlyList<int> announcementIds,
        int readerAccountId,
        CancellationToken ct
    )
    {
        var loans = await _dbContext
            .AnnouncementBorrowedAddOns.AsNoTracking()
            .Where(loan => announcementIds.Contains(loan.AnnouncementId))
            .ToListAsync(ct);
        var rows = loans.Select(LoanRowOf).ToList();

        if (rows.Count == 0)
            return NoLoans;

        var entries = await _calendarService.GetLendingEntriesAsync(
            readerAccountId,
            [.. rows.Select(row => row.Key.CalendarEntryId)],
            ct
        );

        return rows.Where(row =>
                entries.TryGetValue(row.Key.CalendarEntryId, out var entry) && Holds(entry, row.Key)
            )
            .ToLookup(
                row => row.AnnouncementId,
                row => new PlacedLoan(
                    row.Position,
                    BorrowedAddOn(row.Key, entries[row.Key.CalendarEntryId])
                )
            );
    }

    [Pure]
    private static AnnouncementAddOnDetails BorrowedAddOn(
        LoanKey key,
        CalendarEntrySummary entry
    ) =>
        new()
        {
            Kind = key.Kind,
            Attendance = null,
            Poll = null,
            SignUpList = null,
            Borrowed = new BorrowedAddOnDetails { AddOnId = key.AddOnId, Entry = entry },
        };

    private readonly record struct LoanKey(
        AnnouncementAddOnKind Kind,
        int CalendarEntryId,
        int? AddOnId
    );

    private sealed record WantedLoan(LoanKey Key, int Position);

    private sealed record LoanRow(int AnnouncementId, LoanKey Key, int Position);

    private sealed record PlacedLoan(int Position, AnnouncementAddOnDetails AddOn);
}
