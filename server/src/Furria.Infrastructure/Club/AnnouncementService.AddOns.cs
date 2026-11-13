using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Furria.Infrastructure.Club;

public sealed partial class AnnouncementService
{
    private const string AttendanceTwiceMessage = "Ein Aushang trägt höchstens eine Zu-/Absage.";
    private const string AddOnShapeMessage = "Diese Funktion passt nicht zu ihren Angaben.";
    private const string ClosedAttendanceEditMessage =
        "Eine geschlossene Zu-/Absage kann nicht mehr geändert werden.";

    private async Task<string?> ReconcileAddOnsAsync(
        Announcement announcement,
        AddOnsWrite write,
        CancellationToken ct
    )
    {
        var addOns = write.AddOns;
        if (AddOnShapeRefusalOf(addOns) is { } shapeRefusal)
            return shapeRefusal;

        if (
            await ReconcileLoansAsync(announcement, addOns, write.ActorAccountId, ct) is
            { } loanRefusal
        )
            return loanRefusal;

        var now = _timeProvider.GetUtcNow();
        var hostClosesAt = AnnouncementAddOns.ClosesAt(announcement.ValidUntil);
        var heldAttendance = announcement.AttendancePosition is not null;
        var heldPollIds = announcement.Polls.Select(poll => poll.Id).ToList();
        var heldSignUpListIds = announcement.SignUpLists.Select(list => list.Id).ToList();

        if (ApplyAttendance(announcement, addOns, hostClosesAt, now) is { } attendanceRefusal)
            return attendanceRefusal;

        if (
            await _dbContext.ReconcilePollsAsync(
                new AddOnHolding<Poll>(announcement.Polls, hostClosesAt),
                [.. addOns.Select(addOn => addOn.Poll)],
                now,
                ct
            ) is
            { } pollRefusal
        )
            return pollRefusal;

        if (
            _dbContext.ReconcileSignUpLists(
                new AddOnHolding<SignUpList>(announcement.SignUpLists, hostClosesAt),
                [.. addOns.Select(addOn => addOn.SignUpList)],
                now
            ) is
            { } listRefusal
        )
            return listRefusal;

        if (heldAttendance && announcement.AttendancePosition is null)
            await DiscardAnswersAsync(announcement.Id, ct);

        await DropRemindersOfAsync(
            announcement,
            DroppedReminderTagsOf(
                announcement,
                new HeldAddOnIds(heldAttendance, heldPollIds, heldSignUpListIds)
            ),
            ct
        );

        return null;
    }

    [Pure]
    private static IReadOnlyList<string> DroppedReminderTagsOf(
        Announcement announcement,
        HeldAddOnIds held
    ) =>
        [
            .. (held.Attendance && announcement.AttendancePosition is null)
                ?
                [
                    AnnouncementPushMessages.ReminderTagOf(
                        announcement.Id,
                        AnnouncementAddOnKind.Attendance,
                        announcement.Id
                    ),
                ]
                : Array.Empty<string>(),
            .. held
                .PollIds.Where(pollId => announcement.Polls.All(poll => poll.Id != pollId))
                .Select(pollId =>
                    AnnouncementPushMessages.ReminderTagOf(
                        announcement.Id,
                        AnnouncementAddOnKind.Poll,
                        pollId
                    )
                ),
            .. held
                .SignUpListIds.Where(listId =>
                    announcement.SignUpLists.All(list => list.Id != listId)
                )
                .Select(listId =>
                    AnnouncementPushMessages.ReminderTagOf(
                        announcement.Id,
                        AnnouncementAddOnKind.SignUpList,
                        listId
                    )
                ),
        ];

    private async Task DropRemindersOfAsync(
        Announcement announcement,
        IReadOnlyList<string> tags,
        CancellationToken ct
    )
    {
        if (announcement.Id == 0 || tags.Count == 0)
            return;

        await _dbContext.OutboxPushes.Where(push => tags.Contains(push.Tag)).ExecuteDeleteAsync(ct);
    }

    [Pure]
    private static string? AddOnShapeRefusalOf(IReadOnlyList<AnnouncementAddOnInput> addOns)
    {
        if (!addOns.All(HasItsShape))
            return AddOnShapeMessage;

        return
            addOns.Count(addOn =>
                addOn is { Kind: AnnouncementAddOnKind.Attendance, Borrowed: null }
            ) > 1
            ? AttendanceTwiceMessage
            : null;
    }

    [Pure]
    private static bool HasItsShape(AnnouncementAddOnInput addOn) =>
        addOn.Borrowed is { } borrowed ? IsBorrowedShape(addOn, borrowed) : HasItsOwnShape(addOn);

    [Pure]
    private static bool IsBorrowedShape(
        AnnouncementAddOnInput addOn,
        BorrowedAddOnInput borrowed
    ) =>
        addOn is { Attendance: null, Poll: null, SignUpList: null }
        && addOn.Kind switch
        {
            AnnouncementAddOnKind.Attendance => borrowed.AddOnId is null,
            AnnouncementAddOnKind.Poll or AnnouncementAddOnKind.SignUpList => borrowed.AddOnId
                is not null,
            _ => false,
        };

    [Pure]
    private static bool HasItsOwnShape(AnnouncementAddOnInput addOn) =>
        addOn.Kind switch
        {
            AnnouncementAddOnKind.Attendance => addOn
                is { Attendance: not null, Poll: null, SignUpList: null },
            AnnouncementAddOnKind.Poll => addOn
                is { Attendance: null, Poll: not null, SignUpList: null },
            AnnouncementAddOnKind.SignUpList => addOn
                is { Attendance: null, Poll: null, SignUpList: not null },
            _ => false,
        };

    private static string? ApplyAttendance(
        Announcement announcement,
        IReadOnlyList<AnnouncementAddOnInput> addOns,
        DateTimeOffset? hostClosesAt,
        DateTimeOffset now
    )
    {
        var wanted = addOns
            .Select((addOn, position) => (addOn.Attendance, Position: position))
            .FirstOrDefault(placed => placed.Attendance is not null);

        if (announcement.AttendancePosition is not null)
        {
            announcement.AttendanceClosedAt ??= AddOnClosing.StampOf(
                announcement.AnswersUntil,
                hostClosesAt,
                now
            );

            if (
                announcement.AttendanceClosedAt is not null
                && wanted.Attendance is { } kept
                && kept.AnswersUntil != announcement.AnswersUntil
            )
                return ClosedAttendanceEditMessage;
        }

        if (wanted.Attendance is { } attendance)
        {
            announcement.AttendancePosition = wanted.Position;
            announcement.AnswersUntil = attendance.AnswersUntil;
            return null;
        }

        DropAttendance(announcement);
        return null;
    }

    private static void DropAttendance(Announcement announcement)
    {
        announcement.AttendancePosition = null;
        announcement.AnswersUntil = null;
        announcement.AttendanceClosedAt = null;
        announcement.AttendanceClosedByPersonId = null;
        announcement.AttendanceLastRemindedAt = null;
    }

    private Task DiscardAnswersAsync(int announcementId, CancellationToken ct) =>
        _dbContext
            .AttendanceResponses.Where(response => response.AnnouncementId == announcementId)
            .ExecuteDeleteAsync(ct);

    private async Task<IReadOnlyDictionary<int, AnnouncementAddOnsOfReader>> AddOnsOfAsync(
        IReadOnlyList<AnnouncementRow> rows,
        AnnouncementReader reader,
        CancellationToken ct
    )
    {
        var viewerPersonId = reader.Mentions.PersonId;
        var now = _timeProvider.GetUtcNow();
        var ids = rows.Select(row => row.AnnouncementId).ToList();
        var polls = await _dbContext.PollsOfAnnouncementsAsync(ids, viewerPersonId, now, ct);
        var lists = await _dbContext.SignUpListsOfAnnouncementsAsync(ids, viewerPersonId, now, ct);
        var answers = await AnswersOnAsync(
            [
                .. rows.Where(row => row.Attendance.Position is not null)
                    .Select(row => row.AnnouncementId),
            ],
            ct
        );
        var concern = await ConcernOfAsync(rows, reader, polls.Count + lists.Count > 0, ct);
        var loans = await LoansOfAsync(ids, reader.AccountId, ct);

        return rows.ToDictionary(
            row => row.AnnouncementId,
            row =>
                AddOnsOf(
                    row,
                    new HeldAddOns(
                        polls.GetValueOrDefault(row.AnnouncementId, []),
                        lists.GetValueOrDefault(row.AnnouncementId, []),
                        [.. answers[row.AnnouncementId]],
                        [.. loans[row.AnnouncementId]]
                    ),
                    concern.For(ManagedBy(row, reader), reader.Mentions.PersonId),
                    now
                )
        );
    }

    private async Task<ReaderConcern> ConcernOfAsync(
        IReadOnlyList<AnnouncementRow> rows,
        AnnouncementReader reader,
        bool holdsPollsOrLists,
        CancellationToken ct
    )
    {
        if (!holdsPollsOrLists && rows.All(row => row.Attendance.Position is null))
            return ReaderConcern.Nothing;

        var viewerPersonId = reader.Mentions.PersonId;
        var concerned = await _dbContext.AnnouncementConcernedIdsAsync(
            ClubClock.Today(_timeProvider),
            ct
        );
        var managesAny = rows.Any(row => ManagedBy(row, reader));

        return new ReaderConcern(
            concerned,
            managesAny
                ? await _dbContext.PeopleNamedAsync(concerned, ct)
                : AddOnConcern.NobodyNamed,
            managesAny
                ? await _dbContext.ReachablePersonIdsAsync(concerned, viewerPersonId, ct)
                : AddOnConcern.NobodyReachable,
            viewerPersonId is { } personId && concerned.Contains(personId)
        );
    }

    [Pure]
    private static bool ManagedBy(AnnouncementRow row, AnnouncementReader reader) =>
        reader.MayPostAnnouncements
        || row.Author is { } author && author.PersonId == reader.Mentions.PersonId;

    private async Task<ILookup<int, CalendarAttendanceAnswerDetails>> AnswersOnAsync(
        IReadOnlyList<int> announcementIds,
        CancellationToken ct
    )
    {
        if (announcementIds.Count == 0)
            return Array
                .Empty<AnnouncementAnswerRow>()
                .ToLookup(row => row.AnnouncementId, row => row.Answer);

        var answers = await _dbContext
            .AttendanceResponses.AsNoTracking()
            .Where(response => announcementIds.Contains(response.AnnouncementId!.Value))
            .OrderBy(response =>
                EF.Functions.Collate(response.Person!.FirstName, GermanCollation.Name)
            )
            .ThenBy(response =>
                EF.Functions.Collate(response.Person!.LastName, GermanCollation.Name)
            )
            .ThenBy(response => response.PersonId)
            .Select(response => new AnnouncementAnswerRow(
                response.AnnouncementId!.Value,
                new CalendarAttendanceAnswerDetails
                {
                    PersonId = response.PersonId,
                    FirstName = response.Person!.FirstName,
                    LastName = response.Person!.LastName,
                    Answer = response.Answer,
                    RecordedByFirstName = null,
                    RecordedByLastName = null,
                    AnsweredAt = response.UpdatedAt,
                }
            ))
            .ToListAsync(ct);

        return answers.ToLookup(row => row.AnnouncementId, row => row.Answer);
    }

    [Pure]
    private static AnnouncementAddOnsOfReader AddOnsOf(
        AnnouncementRow row,
        HeldAddOns held,
        AddOnConcernOfReader concern,
        DateTimeOffset now
    )
    {
        var hostClosesAt = AnnouncementAddOns.ClosesAt(row.ValidUntil);
        var placed = new List<(int Position, AnnouncementAddOnDetails AddOn)>();

        if (row.Attendance.Position is { } attendancePosition)
            placed.Add(
                (
                    attendancePosition,
                    AttendanceAddOn(
                        AttendanceOf(row.Attendance, held.Answers, concern, hostClosesAt, now)
                    )
                )
            );

        placed.AddRange(
            held.Polls.Select(poll => (poll.Position, PollAddOn(WithConcern(poll, concern))))
        );
        placed.AddRange(
            held.SignUpLists.Select(list =>
                (list.Position, SignUpListAddOn(WithConcern(list, concern)))
            )
        );

        var holdsOwnAddOns = placed.Count > 0;
        placed.AddRange(held.Loans.Select(loan => (loan.Position, loan.AddOn)));

        return new AnnouncementAddOnsOfReader(
            [.. placed.OrderBy(addOn => addOn.Position).Select(addOn => addOn.AddOn)],
            AnswerCountOf(held),
            held.Answers.FirstOrDefault(answer =>
                answer.PersonId == concern.ViewerPersonId
            )?.Answer,
            concern.ViewerIsConcerned && holdsOwnAddOns,
            concern.Manages
        );
    }

    [Pure]
    private static int AnswerCountOf(HeldAddOns held) =>
        held.Answers.Count
        + held.Polls.Sum(poll => poll.VoterIds.Count)
        + held.SignUpLists.Sum(list => list.Details.Lines.Count);

    [Pure]
    private static AnnouncementAttendanceDetails AttendanceOf(
        AnnouncementAttendanceRow attendance,
        IReadOnlyList<CalendarAttendanceAnswerDetails> answers,
        AddOnConcernOfReader concern,
        DateTimeOffset? hostClosesAt,
        DateTimeOffset now
    )
    {
        var answeredIds = answers.Select(answer => answer.PersonId).ToHashSet();

        return new AnnouncementAttendanceDetails
        {
            AnswersUntil = attendance.AnswersUntil,
            ClosedAt = attendance.ClosedAt,
            ClosedBy = CalendarClosers.Of(
                attendance.ClosedByFirstName,
                attendance.ClosedByLastName
            ),
            IsClosed = AddOnClosing.IsClosed(
                attendance.ClosedAt,
                attendance.AnswersUntil,
                hostClosesAt,
                now
            ),
            Yes = answers.Count(answer => answer.Answer == AttendanceAnswer.Yes),
            Maybe = answers.Count(answer => answer.Answer == AttendanceAnswer.Maybe),
            No = answers.Count(answer => answer.Answer == AttendanceAnswer.No),
            ConcernedCount = AddOnConcern.ShareTotalOf(concern.Concerned, answeredIds),
            Answers = answers,
            NotAnswered = concern.Manages
                ? AddOnConcern.MissingFrom(concern.Named, answeredIds)
                : null,
            Reminder = concern.Manages
                ? AddOnConcern.ReminderOf(attendance.LastRemindedAt, concern.Reachable, answeredIds)
                : null,
        };
    }

    [Pure]
    private static PollDetails WithConcern(PlacedPoll poll, AddOnConcernOfReader concern) =>
        poll.Details with
        {
            ConcernedCount = AddOnConcern.ShareTotalOf(concern.Concerned, poll.VoterIds),
            NotAnswered = concern.Manages
                ? AddOnConcern.MissingFrom(concern.Named, poll.VoterIds)
                : null,
            Reminder = concern.Manages
                ? AddOnConcern.ReminderOf(poll.LastRemindedAt, concern.Reachable, poll.VoterIds)
                : null,
        };

    [Pure]
    private static SignUpListDetails WithConcern(
        PlacedSignUpList list,
        AddOnConcernOfReader concern
    )
    {
        var signedUpIds = AddOnConcern.SignedUpIdsOf(list.Details);

        return list.Details with
        {
            ConcernedCount = AddOnConcern.ShareTotalOf(concern.Concerned, signedUpIds),
            NotAnswered = concern.Manages
                ? AddOnConcern.MissingFrom(concern.Named, signedUpIds)
                : null,
            Reminder = concern.Manages
                ? AddOnConcern.ReminderOf(list.LastRemindedAt, concern.Reachable, signedUpIds)
                : null,
        };
    }

    [Pure]
    private static AnnouncementAddOnDetails AttendanceAddOn(
        AnnouncementAttendanceDetails attendance
    ) =>
        new()
        {
            Kind = AnnouncementAddOnKind.Attendance,
            Attendance = attendance,
            Poll = null,
            SignUpList = null,
            Borrowed = null,
        };

    [Pure]
    private static AnnouncementAddOnDetails PollAddOn(PollDetails poll) =>
        new()
        {
            Kind = AnnouncementAddOnKind.Poll,
            Attendance = null,
            Poll = poll,
            SignUpList = null,
            Borrowed = null,
        };

    [Pure]
    private static AnnouncementAddOnDetails SignUpListAddOn(SignUpListDetails list) =>
        new()
        {
            Kind = AnnouncementAddOnKind.SignUpList,
            Attendance = null,
            Poll = null,
            SignUpList = list,
            Borrowed = null,
        };

    private sealed record AddOnsWrite(
        IReadOnlyList<AnnouncementAddOnInput> AddOns,
        int ActorAccountId
    );

    private sealed record HeldAddOnIds(
        bool Attendance,
        IReadOnlyList<int> PollIds,
        IReadOnlyList<int> SignUpListIds
    );

    private sealed record AnnouncementAnswerRow(
        int AnnouncementId,
        CalendarAttendanceAnswerDetails Answer
    );

    private sealed record HeldAddOns(
        IReadOnlyList<PlacedPoll> Polls,
        IReadOnlyList<PlacedSignUpList> SignUpLists,
        IReadOnlyList<CalendarAttendanceAnswerDetails> Answers,
        IReadOnlyList<PlacedLoan> Loans
    );

    private sealed record ReaderConcern(
        IReadOnlySet<int> Concerned,
        IReadOnlyList<CalendarAttendancePerson> Named,
        IReadOnlySet<int> Reachable,
        bool ViewerIsConcerned
    )
    {
        public static readonly ReaderConcern Nothing = new(
            AddOnConcern.NobodyReachable,
            AddOnConcern.NobodyNamed,
            AddOnConcern.NobodyReachable,
            false
        );

        [Pure]
        public AddOnConcernOfReader For(bool manages, int? viewerPersonId) =>
            new(Concerned, Named, Reachable, ViewerIsConcerned, viewerPersonId, manages);
    }

    private sealed record AddOnConcernOfReader(
        IReadOnlySet<int> Concerned,
        IReadOnlyList<CalendarAttendancePerson> Named,
        IReadOnlySet<int> Reachable,
        bool ViewerIsConcerned,
        int? ViewerPersonId,
        bool Manages
    );
}

internal sealed record AnnouncementAddOnsOfReader(
    IReadOnlyList<AnnouncementAddOnDetails> AddOns,
    int AnswerCount,
    AttendanceAnswer? ViewerAnswer,
    bool ViewerMayAnswer,
    bool ViewerManages
);
