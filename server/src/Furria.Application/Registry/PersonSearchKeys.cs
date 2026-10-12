using Furria.Application.Authorization;

namespace Furria.Application.Registry;

public static class PersonSearchKeys
{
    public static readonly IReadOnlyList<string> Searchers =
    [
        FurriaPermissions.PersonsManage,
        FurriaPermissions.GroupsManage,
        FurriaPermissions.RolesManage,
        FurriaPermissions.ClubManage,
        FurriaPermissions.KeyHoldingsManage,
        FurriaPermissions.BoardManage,
        FurriaPermissions.CalendarManageClub,
        FurriaPermissions.AccountsManage,
    ];
}
