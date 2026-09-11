namespace Furria.Application.Authorization;

public static class FurriaPermissions
{
    public const string PersonsReadDetails = "persons.read_details";
    public const string PersonsManage = "persons.manage";
    public const string GroupsManage = "groups.manage";
    public const string RolesManage = "roles.manage";

    public static readonly IReadOnlyList<string> All =
    [
        PersonsReadDetails,
        PersonsManage,
        GroupsManage,
        RolesManage,
    ];
}
