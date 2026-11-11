using System.Diagnostics.Contracts;
using Furria.Application.Club;
using Furria.Core.Club;

namespace Furria.Infrastructure.Club;

internal static class CalendarAddOnRecords
{
    [Pure]
    internal static IReadOnlyList<CalendarEntryAddOnDetails> InCardOrder(
        int? attendancePosition,
        int? participatingGroupsPosition,
        IReadOnlyList<PlacedPoll> polls,
        IReadOnlyList<PlacedSignUpList> signUpLists,
        IReadOnlyList<PlacedDaySchedule> daySchedules
    ) =>
        [
            .. new (int? Position, CalendarEntryAddOnDetails AddOn)[]
            {
                (attendancePosition, SingleUse(CalendarEntryAddOnKind.Attendance)),
                (
                    participatingGroupsPosition,
                    SingleUse(CalendarEntryAddOnKind.ParticipatingGroups)
                ),
            }
                .Concat(
                    polls.Select(poll =>
                        (Position: (int?)poll.Position, AddOn: PollAddOn(poll.Details))
                    )
                )
                .Concat(
                    signUpLists.Select(list =>
                        (Position: (int?)list.Position, AddOn: SignUpListAddOn(list.Details))
                    )
                )
                .Concat(
                    daySchedules.Select(schedule =>
                        (
                            Position: (int?)schedule.Position,
                            AddOn: DayScheduleAddOn(schedule.Details)
                        )
                    )
                )
                .Where(addOn => addOn.Position is not null)
                .OrderBy(addOn => addOn.Position)
                .Select(addOn => addOn.AddOn),
        ];

    [Pure]
    internal static IReadOnlyList<CalendarEntryAddOnKind> KindsOf(
        IReadOnlyList<CalendarEntryAddOnInput> addOns
    ) => [.. addOns.Select(addOn => addOn.Kind)];

    [Pure]
    private static CalendarEntryAddOnDetails SingleUse(CalendarEntryAddOnKind kind) =>
        new()
        {
            Kind = kind,
            Poll = null,
            SignUpList = null,
            DaySchedule = null,
        };

    [Pure]
    private static CalendarEntryAddOnDetails PollAddOn(CalendarPollDetails poll) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.Poll,
            Poll = poll,
            SignUpList = null,
            DaySchedule = null,
        };

    [Pure]
    private static CalendarEntryAddOnDetails SignUpListAddOn(CalendarSignUpListDetails list) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.SignUpList,
            Poll = null,
            SignUpList = list,
            DaySchedule = null,
        };

    [Pure]
    private static CalendarEntryAddOnDetails DayScheduleAddOn(
        CalendarDayScheduleDetails schedule
    ) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.DaySchedule,
            Poll = null,
            SignUpList = null,
            DaySchedule = schedule,
        };
}
