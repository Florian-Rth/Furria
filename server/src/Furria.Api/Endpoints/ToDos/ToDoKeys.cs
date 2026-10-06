using Furria.Application.Authorization;

namespace Furria.Api.Endpoints.ToDos;

internal static class ToDoKeys
{
    public static readonly string[] All =
    [
        FurriaPermissions.PersonsManage,
        FurriaPermissions.KeyHoldingsManage,
        FurriaPermissions.ClubManage,
        FurriaPermissions.MembershipApplicationsDecide,
    ];
}
