using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;
using Furria.Infrastructure.WhatsApp;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantAddOnFacts
{
    private const string PollKind = "Umfrage";
    private const string SignUpListKind = "Eintragliste";

    public const string AttendanceKind = "Zu-/Absage";

    [Pure]
    public static AddOnsFact OfEntry(CalendarEntrySummary entry, string appUrl) =>
        new(
            entry.Title,
            ClubAssistantFacts.MomentOf(entry.StartsAt),
            WhatsAppHostLinks.CalendarEntryOf(appUrl, entry.CalendarEntryId),
            entry.MayAnswer,
            EntryAttendanceOf(entry, takenFrom: null),
            [.. entry.ParticipatingGroups.Select(group => group.Name)],
            [.. entry.AddOns.Select(addOn => addOn.Poll).OfType<PollDetails>().Select(PollOf)],
            [
                .. entry
                    .AddOns.Select(addOn => addOn.SignUpList)
                    .OfType<SignUpListDetails>()
                    .Select(SignUpListOf),
            ],
            [
                .. entry
                    .AddOns.Select(addOn => addOn.DaySchedule)
                    .OfType<CalendarDayScheduleDetails>()
                    .Select(schedule => DayScheduleOf(schedule, entry.StartsAt)),
            ]
        );

    [Pure]
    public static AddOnsFact OfAnnouncement(AnnouncementSummary announcement, string appUrl)
    {
        var addOns = announcement.AddOns;

        return new AddOnsFact(
            announcement.Title,
            null,
            WhatsAppHostLinks.AnnouncementOf(appUrl, announcement.AnnouncementId),
            announcement.ViewerMayAnswer
                || addOns.Any(addOn => addOn.Borrowed is { Entry.MayAnswer: true }),
            AnnouncementAttendanceOf(announcement),
            [],
            [
                .. addOns.Select(addOn => addOn.Poll).OfType<PollDetails>().Select(PollOf),
                .. addOns.Select(BorrowedPollOf).OfType<PollFact>(),
            ],
            [
                .. addOns
                    .Select(addOn => addOn.SignUpList)
                    .OfType<SignUpListDetails>()
                    .Select(SignUpListOf),
                .. addOns.Select(BorrowedSignUpListOf).OfType<SignUpListFact>(),
            ],
            []
        );
    }

    [Pure]
    public static IReadOnlyList<string> KindsOf(IEnumerable<CalendarEntryAddOnKind> kinds) =>
        [.. kinds.Select(KindOf).OfType<string>().Distinct()];

    [Pure]
    public static IReadOnlyList<string> KindsOf(IEnumerable<AnnouncementAddOnKind> kinds) =>
        [.. kinds.Select(KindOf).Distinct()];

    [Pure]
    public static string AnswerOf(AttendanceAnswer answer) =>
        answer switch
        {
            AttendanceAnswer.Yes => "Zusage",
            AttendanceAnswer.Maybe => "Vielleicht",
            AttendanceAnswer.No => "Absage",
            _ => throw new ArgumentOutOfRangeException(nameof(answer), answer, null),
        };

    [Pure]
    private static AttendanceFact? EntryAttendanceOf(
        CalendarEntrySummary entry,
        string? takenFrom
    ) =>
        entry.Attendance is { } attendance
            ? new AttendanceFact(
                attendance.Yes,
                attendance.Maybe,
                attendance.No,
                null,
                attendance.IsClosed,
                entry.ViewerAnswer is { } answer ? AnswerOf(answer) : null,
                takenFrom
            )
            : null;

    [Pure]
    private static AttendanceFact? AnnouncementAttendanceOf(AnnouncementSummary announcement)
    {
        foreach (var addOn in announcement.AddOns)
        {
            if (addOn.Attendance is { } attendance)
                return new AttendanceFact(
                    attendance.Yes,
                    attendance.Maybe,
                    attendance.No,
                    MomentOrNull(attendance.AnswersUntil),
                    attendance.IsClosed,
                    announcement.ViewerAnswer is { } answer ? AnswerOf(answer) : null,
                    null
                );

            if (addOn is { Kind: AnnouncementAddOnKind.Attendance, Borrowed: { } borrowed })
                return EntryAttendanceOf(borrowed.Entry, borrowed.Entry.Title);
        }

        return null;
    }

    [Pure]
    private static PollFact? BorrowedPollOf(AnnouncementAddOnDetails addOn) =>
        addOn is { Kind: AnnouncementAddOnKind.Poll, Borrowed: { } borrowed }
        && borrowed
            .Entry.AddOns.Select(held => held.Poll)
            .FirstOrDefault(poll => poll?.PollId == borrowed.AddOnId)
            is { } poll
            ? PollOf(poll) with
            {
                TakenFrom = borrowed.Entry.Title,
            }
            : null;

    [Pure]
    private static SignUpListFact? BorrowedSignUpListOf(AnnouncementAddOnDetails addOn) =>
        addOn is { Kind: AnnouncementAddOnKind.SignUpList, Borrowed: { } borrowed }
        && borrowed
            .Entry.AddOns.Select(held => held.SignUpList)
            .FirstOrDefault(list => list?.SignUpListId == borrowed.AddOnId)
            is { } list
            ? SignUpListOf(list) with
            {
                TakenFrom = borrowed.Entry.Title,
            }
            : null;

    [Pure]
    private static PollFact PollOf(PollDetails poll) =>
        new(
            poll.Question,
            poll.AllowsMultipleChoices,
            poll.IsAnonymous,
            MomentOrNull(poll.VotesUntil),
            poll.IsClosed,
            poll.VoterCount,
            [
                .. poll.Options.Select(option => new PollOptionFact(
                    option.Label,
                    option.VoteCount,
                    option.ViewerChose
                )),
            ],
            null
        );

    [Pure]
    private static SignUpListFact SignUpListOf(SignUpListDetails list)
    {
        var ownLine = list.Lines.FirstOrDefault(line => line.ByViewer);

        return new SignUpListFact(
            list.Title,
            list.Hint,
            MomentOrNull(list.SignUpUntil),
            list.IsClosed,
            list.Lines.Count,
            [
                .. list
                    .Lines.Where(line => !line.ByViewer)
                    .Select(line => line.Text)
                    .OfType<string>()
                    .Where(text => !string.IsNullOrWhiteSpace(text)),
            ],
            ownLine is not null,
            ownLine?.Text,
            null
        );
    }

    [Pure]
    private static DayScheduleFact DayScheduleOf(
        CalendarDayScheduleDetails schedule,
        DateTimeOffset entryStartsAt
    )
    {
        var firstDay = ClubClock.DayOf(entryStartsAt);

        return new DayScheduleFact(
            schedule.Title,
            [
                .. schedule.Steps.Select(step =>
                {
                    var day = firstDay.AddDays(step.Day);
                    return new DayScheduleStepFact(
                        ClubAssistantFacts.DayOf(day),
                        ClubAssistantFacts.WeekdayOf(day.DayOfWeek),
                        ClubAssistantFacts.TimeOf(step.Time),
                        step.Text
                    );
                }),
            ]
        );
    }

    [Pure]
    private static ClubMomentFact? MomentOrNull(DateTimeOffset? instant) =>
        instant is { } value ? ClubAssistantFacts.MomentOf(value) : null;

    [Pure]
    private static string? KindOf(CalendarEntryAddOnKind kind) =>
        kind switch
        {
            CalendarEntryAddOnKind.Attendance => AttendanceKind,
            CalendarEntryAddOnKind.ParticipatingGroups => null,
            CalendarEntryAddOnKind.Poll => PollKind,
            CalendarEntryAddOnKind.SignUpList => SignUpListKind,
            CalendarEntryAddOnKind.DaySchedule => "Tagesablauf",
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };

    [Pure]
    private static string KindOf(AnnouncementAddOnKind kind) =>
        kind switch
        {
            AnnouncementAddOnKind.Attendance => AttendanceKind,
            AnnouncementAddOnKind.Poll => PollKind,
            AnnouncementAddOnKind.SignUpList => SignUpListKind,
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };
}
