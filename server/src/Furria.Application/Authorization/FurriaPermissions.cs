namespace Furria.Application.Authorization;

public static class FurriaPermissions
{
    public const string PersonsReadDetails = "persons.read_details";
    public const string PersonsManage = "persons.manage";
    public const string GroupsManage = "groups.manage";
    public const string RolesManage = "roles.manage";
    public const string AnnouncementsPost = "announcements.post";
    public const string ClubManage = "club.manage";
    public const string KeyHoldingsManage = "key_holdings.manage";
    public const string BoardManage = "board.manage";
    public const string CalendarManageClub = "calendar.manage_club";
    public const string ClubRead = "club.read";

    public static readonly IReadOnlyList<string> All =
    [
        PersonsReadDetails,
        PersonsManage,
        GroupsManage,
        RolesManage,
        AnnouncementsPost,
        ClubManage,
        KeyHoldingsManage,
        BoardManage,
        CalendarManageClub,
    ];

    public static readonly IReadOnlyList<string> ImpliedByRelationship = [ClubRead];
}
