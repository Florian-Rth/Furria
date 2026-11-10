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
        IReadOnlyList<PlacedSignUpList> signUpLists
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
        };

    [Pure]
    private static CalendarEntryAddOnDetails PollAddOn(CalendarPollDetails poll) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.Poll,
            Poll = poll,
            SignUpList = null,
        };

    [Pure]
    private static CalendarEntryAddOnDetails SignUpListAddOn(CalendarSignUpListDetails list) =>
        new()
        {
            Kind = CalendarEntryAddOnKind.SignUpList,
            Poll = null,
            SignUpList = list,
        };
}
