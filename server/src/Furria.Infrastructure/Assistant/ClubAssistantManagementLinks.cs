using System.Diagnostics.Contracts;
using System.Globalization;
using Furria.Application.Management;

namespace Furria.Infrastructure.Assistant;

public static class ClubAssistantManagementLinks
{
    private const string GroupsPath = "/groups";

    [Pure]
    public static string EventOf(string appUrl, int eventId) =>
        Of(appUrl, string.Create(CultureInfo.InvariantCulture, $"/events/{eventId}"));

    [Pure]
    public static string RunningOrderOf(string appUrl, int eventId) =>
        Of(appUrl, string.Create(CultureInfo.InvariantCulture, $"/events/{eventId}/running-order"));

    [Pure]
    public static string TablePlanOf(string appUrl, int eventId) =>
        Of(appUrl, string.Create(CultureInfo.InvariantCulture, $"/events/{eventId}/table-plan"));

    [Pure]
    public static string ToDoOf(string appUrl, ToDoSummary toDo) =>
        Of(
            appUrl,
            toDo switch
            {
                { Kind: ToDoKind.GroupMatcherStatementsOpen, Group: { } group } => string.Create(
                    CultureInfo.InvariantCulture,
                    $"{GroupsPath}/{group.GroupId}/group-matcher"
                ),
                { Kind: ToDoKind.GroupMatcherStatementsOpen } => GroupsPath,
                _ => ClubToDoPathOf(toDo.Kind),
            }
        );

    [Pure]
    private static string ClubToDoPathOf(ToDoKind kind) =>
        kind switch
        {
            ToDoKind.NeverInvited or ToDoKind.ReminderDue => "/manage?changed=access",
            ToDoKind.InPersonOnly => "/manage/persons?access=without-email",
            ToDoKind.BirthDateUnknown => "/manage/persons?access=birth-date-unknown",
            ToDoKind.KeyToTakeBack => "/manage/keys",
            ToDoKind.ClubRecordGap => "/manage/club-record",
            ToDoKind.ApplicationWaiting => "/manage/applications",
            _ => throw new ArgumentOutOfRangeException(nameof(kind), kind, null),
        };

    [Pure]
    private static string Of(string appUrl, string path) => $"{appUrl.TrimEnd('/')}{path}";
}
