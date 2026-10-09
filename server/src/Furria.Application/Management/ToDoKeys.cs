using System.Collections.Frozen;
using System.Diagnostics.Contracts;
using Furria.Application.Authorization;

namespace Furria.Application.Management;

public static class ToDoKeys
{
    private static readonly FrozenDictionary<ToDoKind, string[]> RequiredKeys = new Dictionary<
        ToDoKind,
        string[]
    >
    {
        [ToDoKind.NeverInvited] = [FurriaPermissions.PersonsManage],
        [ToDoKind.ReminderDue] = [FurriaPermissions.PersonsManage],
        [ToDoKind.InPersonOnly] = [FurriaPermissions.PersonsManage],
        [ToDoKind.BirthDateUnknown] =
        [
            FurriaPermissions.PersonsManage,
            FurriaPermissions.AccountsManage,
        ],
        [ToDoKind.KeyToTakeBack] = [FurriaPermissions.KeyHoldingsManage],
        [ToDoKind.ClubRecordGap] = [FurriaPermissions.ClubManage],
        [ToDoKind.ApplicationWaiting] = [FurriaPermissions.MembershipApplicationsDecide],
        [ToDoKind.TicketRequestWaiting] = [FurriaPermissions.TicketRequestsHandle],
    }.ToFrozenDictionary();

    public static readonly string[] Openers =
    [
        .. RequiredKeys
            .Values.Where(keys => keys.Length == 1)
            .Select(keys => keys[0])
            .Distinct(StringComparer.Ordinal),
    ];

    [Pure]
    public static bool Shows(ToDoKind kind, IReadOnlySet<string> granted) =>
        RequiredKeys[kind].All(granted.Contains);
}
